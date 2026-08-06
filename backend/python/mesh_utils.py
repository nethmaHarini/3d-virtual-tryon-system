from __future__ import annotations

from typing import Tuple

import numpy as np


MIN_HEIGHT_CM = 100.0
MAX_HEIGHT_CM = 230.0


def validate_vertices(vertices: np.ndarray) -> np.ndarray:
    """
    Validate and convert avatar vertices to a NumPy float32 array.

    Expected shape:
        (number_of_vertices, 3)
    """
    validated_vertices = np.asarray(
        vertices,
        dtype=np.float32,
    )

    if validated_vertices.ndim != 2:
        raise ValueError(
            "Avatar vertices must be a two-dimensional array."
        )

    if validated_vertices.shape[1] != 3:
        raise ValueError(
            "Each avatar vertex must contain X, Y, and Z coordinates."
        )

    if validated_vertices.shape[0] == 0:
        raise ValueError(
            "The avatar contains no vertices."
        )

    if not np.isfinite(validated_vertices).all():
        raise ValueError(
            "Avatar vertices contain invalid values."
        )

    return validated_vertices


def validate_height(height_cm: float) -> float:
    """
    Validate user height in centimetres.
    """
    try:
        validated_height = float(height_cm)
    except (TypeError, ValueError) as error:
        raise ValueError(
            "Height must be a numeric value."
        ) from error

    if not MIN_HEIGHT_CM <= validated_height <= MAX_HEIGHT_CM:
        raise ValueError(
            f"Height must be between "
            f"{MIN_HEIGHT_CM:.0f} cm and "
            f"{MAX_HEIGHT_CM:.0f} cm."
        )

    return validated_height


def calculate_mesh_height(vertices: np.ndarray) -> float:
    """
    Calculate avatar height using the Y axis.

    Returns:
        Height in the same unit as the supplied vertices.
    """
    validated_vertices = validate_vertices(
        vertices
    )

    minimum_y = float(
        validated_vertices[:, 1].min()
    )

    maximum_y = float(
        validated_vertices[:, 1].max()
    )

    mesh_height = maximum_y - minimum_y

    if mesh_height <= 0:
        raise ValueError(
            "The avatar mesh has an invalid height."
        )

    return mesh_height


def normalize_avatar(
    vertices: np.ndarray,
    height_cm: float,
) -> Tuple[np.ndarray, float]:
    """
    Center, ground, and scale an avatar mesh.

    Processing:
        1. Center the mesh on the X and Z axes.
        2. Move the lowest Y point to Y = 0.
        3. Scale the mesh to the user's height.

    Args:
        vertices:
            Avatar vertex array with shape (N, 3).

        height_cm:
            User height in centimetres.

    Returns:
        A tuple containing:
            - normalized avatar vertices,
            - scale factor used.
    """
    validated_vertices = validate_vertices(
        vertices
    ).copy()

    validated_height_cm = validate_height(
        height_cm
    )

    # Center the avatar horizontally.
    validated_vertices[:, 0] -= np.mean(
        validated_vertices[:, 0]
    )

    validated_vertices[:, 2] -= np.mean(
        validated_vertices[:, 2]
    )

    # Place the feet on the ground.
    lowest_y = float(
        validated_vertices[:, 1].min()
    )

    validated_vertices[:, 1] -= lowest_y

    current_height_m = calculate_mesh_height(
        validated_vertices
    )

    target_height_m = (
        validated_height_cm / 100.0
    )

    scale_factor = (
        target_height_m / current_height_m
    )

    normalized_vertices = (
        validated_vertices * scale_factor
    ).astype(np.float32)

    # Ground the mesh again after scaling.
    normalized_vertices[:, 1] -= float(
        normalized_vertices[:, 1].min()
    )

    final_height_m = calculate_mesh_height(
        normalized_vertices
    )

    height_error = abs(
        final_height_m - target_height_m
    )

    if height_error > 0.001:
        raise ValueError(
            "The avatar could not be scaled accurately."
        )

    return normalized_vertices, float(scale_factor)


def calculate_bounds(
    vertices: np.ndarray,
) -> Tuple[np.ndarray, np.ndarray]:
    """
    Return minimum and maximum XYZ coordinates.
    """
    validated_vertices = validate_vertices(
        vertices
    )

    minimum_coordinates = validated_vertices.min(
        axis=0
    )

    maximum_coordinates = validated_vertices.max(
        axis=0
    )

    return (
        minimum_coordinates,
        maximum_coordinates,
    )