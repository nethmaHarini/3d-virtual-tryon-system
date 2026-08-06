from __future__ import annotations

from pathlib import Path
from typing import Tuple

import numpy as np
import trimesh


def validate_faces(faces: np.ndarray) -> np.ndarray:
    """
    Validate triangular mesh faces.

    Expected shape:
        (number_of_faces, 3)
    """
    validated_faces = np.asarray(
        faces,
        dtype=np.int32,
    )

    if validated_faces.ndim != 2:
        raise ValueError(
            "Avatar faces must be a two-dimensional array."
        )

    if validated_faces.shape[1] != 3:
        raise ValueError(
            "Each avatar face must contain three vertex indices."
        )

    if validated_faces.shape[0] == 0:
        raise ValueError(
            "The avatar contains no faces."
        )

    if np.any(validated_faces < 0):
        raise ValueError(
            "Avatar faces contain negative vertex indices."
        )

    return validated_faces


def validate_mesh(
    vertices: np.ndarray,
    faces: np.ndarray,
) -> Tuple[np.ndarray, np.ndarray]:
    """
    Validate mesh vertices and faces.
    """
    validated_vertices = np.asarray(
        vertices,
        dtype=np.float32,
    )

    validated_faces = validate_faces(
        faces
    )

    if validated_vertices.ndim != 2:
        raise ValueError(
            "Avatar vertices must be a two-dimensional array."
        )

    if validated_vertices.shape[1] != 3:
        raise ValueError(
            "Each avatar vertex must contain X, Y, and Z."
        )

    if validated_vertices.shape[0] == 0:
        raise ValueError(
            "The avatar contains no vertices."
        )

    if not np.isfinite(validated_vertices).all():
        raise ValueError(
            "Avatar vertices contain invalid values."
        )

    highest_index = int(
        validated_faces.max()
    )

    if highest_index >= len(validated_vertices):
        raise ValueError(
            "A face references a vertex that does not exist."
        )

    return (
        validated_vertices,
        validated_faces,
    )


def create_trimesh(
    vertices: np.ndarray,
    faces: np.ndarray,
) -> trimesh.Trimesh:
    """
    Create a Trimesh object without changing the original mesh.
    """
    validated_vertices, validated_faces = validate_mesh(
        vertices,
        faces,
    )

    mesh = trimesh.Trimesh(
        vertices=validated_vertices,
        faces=validated_faces,
        process=False,
    )

    if mesh.is_empty:
        raise ValueError(
            "The generated mesh is empty."
        )

    return mesh


def export_obj(
    vertices: np.ndarray,
    faces: np.ndarray,
    output_path: str | Path,
) -> Path:
    """
    Export an avatar as a Wavefront OBJ file.
    """
    destination = Path(
        output_path
    ).resolve()

    destination.parent.mkdir(
        parents=True,
        exist_ok=True,
    )

    if destination.suffix.lower() != ".obj":
        destination = destination.with_suffix(
            ".obj"
        )

    mesh = create_trimesh(
        vertices,
        faces,
    )

    mesh.export(
        destination,
        file_type="obj",
    )

    if not destination.exists():
        raise RuntimeError(
            "OBJ export failed."
        )

    return destination


def export_glb(
    vertices: np.ndarray,
    faces: np.ndarray,
    output_path: str | Path,
) -> Path:
    """
    Export an avatar as a binary GLTF/GLB file.
    """
    destination = Path(
        output_path
    ).resolve()

    destination.parent.mkdir(
        parents=True,
        exist_ok=True,
    )

    if destination.suffix.lower() != ".glb":
        destination = destination.with_suffix(
            ".glb"
        )

    mesh = create_trimesh(
        vertices,
        faces,
    )

    scene = trimesh.Scene(
        mesh
    )

    glb_data = scene.export(
        file_type="glb"
    )

    destination.write_bytes(
        glb_data
    )

    if not destination.exists():
        raise RuntimeError(
            "GLB export failed."
        )

    return destination


def export_avatar(
    vertices: np.ndarray,
    faces: np.ndarray,
    output_directory: str | Path,
    file_stem: str = "avatar_tpose",
) -> dict:
    """
    Export both OBJ and GLB avatar files.

    Returns:
        Dictionary containing the generated paths.
    """
    destination_directory = Path(
        output_directory
    ).resolve()

    destination_directory.mkdir(
        parents=True,
        exist_ok=True,
    )

    safe_stem = file_stem.strip()

    if not safe_stem:
        raise ValueError(
            "Avatar filename cannot be empty."
        )

    obj_path = export_obj(
        vertices,
        faces,
        destination_directory / f"{safe_stem}.obj",
    )

    glb_path = export_glb(
        vertices,
        faces,
        destination_directory / f"{safe_stem}.glb",
    )

    return {
        "obj": str(obj_path),
        "glb": str(glb_path),
    }