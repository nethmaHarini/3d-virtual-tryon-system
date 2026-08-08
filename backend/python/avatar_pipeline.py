from __future__ import annotations

import shutil
from pathlib import Path
from typing import Dict

from exporter import export_avatar
from mesh_utils import calculate_mesh_height, normalize_avatar
from pare_runner import PAREInferenceRunner
from person_detector import PersonDetector
from shape_fusion import create_fused_shape
from smpl_generator import generate_smpl_avatar


SUPPORTED_IMAGE_FORMATS = {
    ".jpg",
    ".jpeg",
    ".png",
}


def validate_input_image(
    image_path: str | Path,
    view_name: str,
) -> Path:
    """
    Validate one uploaded body image.
    """
    path = Path(image_path).resolve()

    if not path.exists():
        raise FileNotFoundError(
            f"{view_name.capitalize()} image not found: {path}"
        )

    if not path.is_file():
        raise ValueError(
            f"{view_name.capitalize()} image path is not a file."
        )

    if path.suffix.lower() not in SUPPORTED_IMAGE_FORMATS:
        raise ValueError(
            f"Unsupported {view_name} image format: {path.suffix}"
        )

    return path


def prepare_input_images(
    front_path: str | Path,
    side_path: str | Path,
    back_path: str | Path,
    working_directory: str | Path,
) -> Dict[str, Path]:
    """
    Copy uploaded images into a controlled processing directory.

    The files are renamed to:
        front.jpg/png/jpeg
        side.jpg/png/jpeg
        back.jpg/png/jpeg
    """
    work_dir = Path(working_directory).resolve()

    image_directory = work_dir / "input_images"

    if image_directory.exists():
        shutil.rmtree(image_directory)

    image_directory.mkdir(
        parents=True,
        exist_ok=True,
    )

    source_images = {
        "front": validate_input_image(
            front_path,
            "front",
        ),
        "side": validate_input_image(
            side_path,
            "side",
        ),
        "back": validate_input_image(
            back_path,
            "back",
        ),
    }

    prepared_images: Dict[str, Path] = {}

    for view, source_path in source_images.items():
        destination = (
            image_directory
            / f"{view}{source_path.suffix.lower()}"
        )

        shutil.copy2(
            source_path,
            destination,
        )

        prepared_images[view] = destination

    return prepared_images


def generate_avatar_pipeline(
    front_path: str | Path,
    side_path: str | Path,
    back_path: str | Path,
    height_cm: float,
    body_model: str,
    output_directory: str | Path,
    file_stem: str = "generated_avatar",
) -> dict:
    """
    Execute the complete three-view avatar-generation pipeline.

    Returns:
        {
            "obj": "...",
            "glb": "...",
            "body_model": "...",
            "height_cm": ...,
            "scale_factor": ...,
            "original_height_m": ...,
            "final_height_m": ...
        }
    """
    output_dir = Path(output_directory).resolve()

    output_dir.mkdir(
        parents=True,
        exist_ok=True,
    )

    working_directory = (
        output_dir / "processing"
    )

    working_directory.mkdir(
        parents=True,
        exist_ok=True,
    )

    prepared_images = prepare_input_images(
        front_path=front_path,
        side_path=side_path,
        back_path=back_path,
        working_directory=working_directory,
    )

    # -------------------------------------------------
    # 1. Detect the main person in all three images
    # -------------------------------------------------

    detector = PersonDetector()

    detections = detector.detect_three_views(
        front_path=prepared_images["front"],
        side_path=prepared_images["side"],
        back_path=prepared_images["back"],
    )

    # -------------------------------------------------
    # 2. Run PARE inference
    # -------------------------------------------------

    pare_runner = PAREInferenceRunner(
        body_model=body_model,
    )

    pare_output_directory = (
        working_directory / "pare_output"
    )

    pare_data = pare_runner.run(
        image_directory=prepared_images["front"].parent,
        output_directory=pare_output_directory,
        detections=detections,
    )

    # -------------------------------------------------
    # 3. Fuse front, side, and back SMPL shapes
    # -------------------------------------------------

    fused_shape = create_fused_shape(
        pare_data
    )

    # -------------------------------------------------
    # 4. Generate the SMPL avatar
    # -------------------------------------------------

    smpl_result = generate_smpl_avatar(
        shape_parameters=fused_shape,
        body_model=body_model,
    )

    vertices = smpl_result["vertices"]
    faces = smpl_result["faces"]

    original_height_m = calculate_mesh_height(
        vertices
    )

    # -------------------------------------------------
    # 5. Scale the avatar using the user's height
    # -------------------------------------------------

    normalized_vertices, scale_factor = normalize_avatar(
        vertices=vertices,
        height_cm=height_cm,
    )

    final_height_m = calculate_mesh_height(
        normalized_vertices
    )

    # -------------------------------------------------
    # 6. Export OBJ and GLB
    # -------------------------------------------------

    generated_files = export_avatar(
        vertices=normalized_vertices,
        faces=faces,
        output_directory=output_dir,
        file_stem=file_stem,
    )

    # Remove temporary uploaded photos and PARE results.
    if working_directory.exists():
        shutil.rmtree(
            working_directory,
            ignore_errors=True,
        )

    return {
        "obj": generated_files["obj"],
        "glb": generated_files["glb"],
        "body_model": smpl_result["body_model"],
        "height_cm": float(height_cm),
        "scale_factor": float(scale_factor),
        "original_height_m": float(original_height_m),
        "final_height_m": float(final_height_m),
    }