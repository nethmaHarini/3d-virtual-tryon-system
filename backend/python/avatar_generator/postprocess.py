from __future__ import annotations

from pathlib import Path
from typing import Dict

from exporter import export_avatar
from mesh_utils import (
    calculate_mesh_height,
    normalize_avatar,
)
from shape_fusion import create_fused_shape
from smpl_generator import generate_smpl_avatar


def create_avatar_from_pare_results(
    pare_data: Dict[str, dict],
    body_model: str,
    height_cm: float,
    output_directory: str | Path,
    file_stem: str = "generated_avatar",
) -> dict:
    """
    Convert three PARE results into a normalized SMPL avatar.

    Processing steps:
        1. Fuse front, side, and back shape parameters.
        2. Generate the SMPL body mesh.
        3. Normalize the mesh using the user's height.
        4. Export OBJ and GLB files.
    """

    # Fuse the three PARE shape predictions.
    fused_shape = create_fused_shape(
        pare_data
    )

    # Generate the SMPL avatar mesh.
    smpl_result = generate_smpl_avatar(
        shape_parameters=fused_shape,
        body_model=body_model,
    )

    vertices = smpl_result["vertices"]
    faces = smpl_result["faces"]

    original_height_m = calculate_mesh_height(
        vertices
    )

    # Scale and ground the avatar.
    normalized_vertices, scale_factor = normalize_avatar(
        vertices=vertices,
        height_cm=height_cm,
    )

    final_height_m = calculate_mesh_height(
        normalized_vertices
    )

    # Export the avatar.
    generated_files = export_avatar(
        vertices=normalized_vertices,
        faces=faces,
        output_directory=output_directory,
        file_stem=file_stem,
    )

    return {
        "obj": generated_files["obj"],
        "glb": generated_files["glb"],
        "body_model": smpl_result["body_model"],
        "height_cm": float(height_cm),
        "original_height_m": float(original_height_m),
        "final_height_m": float(final_height_m),
        "scale_factor": float(scale_factor),
        "fused_shape": fused_shape.tolist(),
    }