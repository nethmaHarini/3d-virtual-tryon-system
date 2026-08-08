from __future__ import annotations

import shutil
from pathlib import Path

from avatar_generator.pare_inference import run_pare_inference
from avatar_generator.postprocess import create_avatar_from_pare_results
from avatar_generator.preprocess import prepare_three_view_images
from person_detector import PersonDetector


def generate_personalized_avatar(
    front_path: str | Path,
    side_path: str | Path,
    back_path: str | Path,
    height_cm: float,
    body_model: str,
    output_directory: str | Path,
    file_stem: str = "generated_avatar",
) -> dict:
    """
    Run the complete Implementation 1 avatar-generation pipeline.

    Steps:
        1. Validate and prepare front, side, and back images.
        2. Detect the main person in each image.
        3. Run PARE inference.
        4. Fuse the three body-shape predictions.
        5. Generate and scale the SMPL avatar.
        6. Export OBJ and GLB files.
        7. Delete temporary photos and processing data.
    """
    output_dir = Path(output_directory).resolve()

    output_dir.mkdir(
        parents=True,
        exist_ok=True,
    )

    processing_directory = (
        output_dir / "temporary_processing"
    )

    image_directory = (
        processing_directory / "images"
    )

    pare_output_directory = (
        processing_directory / "pare_output"
    )

    try:
        # 1. Prepare the three uploaded images.
        prepared_images = prepare_three_view_images(
            front_path=front_path,
            side_path=side_path,
            back_path=back_path,
            output_directory=image_directory,
        )

        # 2. Detect the main person in each image.
        detector = PersonDetector()

        detections = detector.detect_three_views(
            front_path=prepared_images["front"],
            side_path=prepared_images["side"],
            back_path=prepared_images["back"],
        )

        # 3. Run PARE inference.
        pare_data = run_pare_inference(
            image_directory=image_directory,
            output_directory=pare_output_directory,
            detections=detections,
            body_model=body_model,
        )

        # 4–6. Fuse shapes, generate SMPL, scale, and export.
        result = create_avatar_from_pare_results(
            pare_data=pare_data,
            body_model=body_model,
            height_cm=height_cm,
            output_directory=output_dir,
            file_stem=file_stem,
        )

        result["success"] = True

        return result

    finally:
        # Uploaded photos and intermediate results are temporary.
        if processing_directory.exists():
            shutil.rmtree(
                processing_directory,
                ignore_errors=True,
            )