from __future__ import annotations

from typing import Dict

import numpy as np


REQUIRED_VIEWS = ("front", "side", "back")
EXPECTED_BETA_COUNT = 10


def extract_shape_predictions(
    pare_data: Dict[str, dict],
) -> Dict[str, np.ndarray]:
    """
    Extract the SMPL shape parameters from the PARE outputs.

    Args:
        pare_data:
            Dictionary containing PARE results for front, side, and back.

    Returns:
        Dictionary containing one NumPy shape vector for each view.

    Raises:
        KeyError:
            If a required view or pred_shape value is missing.
        ValueError:
            If a shape vector does not contain 10 SMPL beta values.
    """
    shape_predictions: Dict[str, np.ndarray] = {}

    for view in REQUIRED_VIEWS:
        if view not in pare_data:
            raise KeyError(
                f"Missing PARE result for the {view} view."
            )

        if "pred_shape" not in pare_data[view]:
            raise KeyError(
                f"'pred_shape' is missing from the {view} result."
            )

        shape = np.asarray(
            pare_data[view]["pred_shape"],
            dtype=np.float32,
        ).squeeze()

        if shape.shape != (EXPECTED_BETA_COUNT,):
            raise ValueError(
                f"{view} pred_shape must contain "
                f"{EXPECTED_BETA_COUNT} values. "
                f"Received shape: {shape.shape}"
            )

        if not np.isfinite(shape).all():
            raise ValueError(
                f"{view} pred_shape contains invalid values."
            )

        shape_predictions[view] = shape

    return shape_predictions


def fuse_shapes(
    shape_predictions: Dict[str, np.ndarray],
) -> np.ndarray:
    """
    Fuse front, side, and back SMPL shape predictions.

    Median fusion is used because it is less affected by one
    inaccurate view than a simple average.

    Args:
        shape_predictions:
            Dictionary containing front, side, and back beta vectors.

    Returns:
        Final fused SMPL beta vector with shape (10,).
    """
    missing_views = [
        view
        for view in REQUIRED_VIEWS
        if view not in shape_predictions
    ]

    if missing_views:
        raise KeyError(
            "Missing shape prediction(s): "
            + ", ".join(missing_views)
        )

    shape_matrix = np.stack(
        [
            np.asarray(
                shape_predictions["front"],
                dtype=np.float32,
            ),
            np.asarray(
                shape_predictions["side"],
                dtype=np.float32,
            ),
            np.asarray(
                shape_predictions["back"],
                dtype=np.float32,
            ),
        ],
        axis=0,
    )

    if shape_matrix.shape != (
        3,
        EXPECTED_BETA_COUNT,
    ):
        raise ValueError(
            "Shape matrix must have size (3, 10). "
            f"Received: {shape_matrix.shape}"
        )

    final_shape = np.median(
        shape_matrix,
        axis=0,
    ).astype(np.float32)

    if not np.isfinite(final_shape).all():
        raise ValueError(
            "The fused shape contains invalid values."
        )

    return final_shape


def create_fused_shape(
    pare_data: Dict[str, dict],
) -> np.ndarray:
    """
    Extract and fuse the three PARE shape predictions.
    """
    predictions = extract_shape_predictions(
        pare_data
    )

    return fuse_shapes(
        predictions
    )