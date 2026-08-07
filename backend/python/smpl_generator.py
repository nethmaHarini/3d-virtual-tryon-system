from __future__ import annotations

from pathlib import Path
from typing import Dict

import numpy as np
import torch
from smplx import SMPL

from model_paths import SMPL_MODEL_DIR


ALLOWED_BODY_MODELS = {
    "male",
    "female",
    "neutral",
}

EXPECTED_BETA_COUNT = 10


def validate_body_model(body_model: str) -> str:
    """
    Validate and normalize the selected SMPL body model.
    """
    normalized_body_model = body_model.lower().strip()

    if normalized_body_model not in ALLOWED_BODY_MODELS:
        raise ValueError(
            "Body model must be male, female, or neutral."
        )

    return normalized_body_model


def validate_shape_parameters(
    shape_parameters: np.ndarray,
) -> np.ndarray:
    """
    Validate the fused SMPL shape vector.

    Expected shape:
        (10,)
    """
    validated_shape = np.asarray(
        shape_parameters,
        dtype=np.float32,
    ).squeeze()

    if validated_shape.shape != (EXPECTED_BETA_COUNT,):
        raise ValueError(
            "SMPL shape parameters must contain exactly "
            f"{EXPECTED_BETA_COUNT} values. "
            f"Received shape: {validated_shape.shape}"
        )

    if not np.isfinite(validated_shape).all():
        raise ValueError(
            "SMPL shape parameters contain invalid values."
        )

    return validated_shape


def generate_smpl_avatar(
    shape_parameters: np.ndarray,
    body_model: str,
    model_directory: str | Path = SMPL_MODEL_DIR,
    device: str | None = None,
) -> Dict[str, np.ndarray]:
    """
    Generate a canonical SMPL avatar from fused shape parameters.

    The avatar is generated in a standard pose using identity
    rotation matrices rather than copying the photographed pose.

    Returns:
        Dictionary containing:
            - vertices
            - faces
            - joints
            - body_model
            - device
    """
    validated_shape = validate_shape_parameters(
        shape_parameters
    )

    validated_body_model = validate_body_model(
        body_model
    )

    model_path = Path(
        model_directory
    ).resolve()

    if not model_path.exists():
        raise FileNotFoundError(
            f"SMPL model directory not found: {model_path}"
        )

    if device is None:
        torch_device = torch.device(
            "cuda" if torch.cuda.is_available() else "cpu"
        )
    else:
        torch_device = torch.device(device)

    betas_tensor = torch.tensor(
        validated_shape,
        dtype=torch.float32,
        device=torch_device,
    ).reshape(1, EXPECTED_BETA_COUNT)

    smpl_model = SMPL(
        model_path=str(model_path),
        gender=validated_body_model,
        batch_size=1,
        num_betas=EXPECTED_BETA_COUNT,
    ).to(torch_device)

    smpl_model.eval()

    identity_rotation = torch.eye(
        3,
        dtype=torch.float32,
        device=torch_device,
    ).reshape(1, 1, 3, 3)

    global_orient = identity_rotation.clone()

    body_pose = identity_rotation.repeat(
        1,
        23,
        1,
        1,
    )

    with torch.no_grad():
        smpl_output = smpl_model(
            betas=betas_tensor,
            global_orient=global_orient,
            body_pose=body_pose,
            pose2rot=False,
        )

    vertices = (
        smpl_output.vertices[0]
        .detach()
        .cpu()
        .numpy()
        .astype(np.float32)
    )

    joints = (
        smpl_output.joints[0]
        .detach()
        .cpu()
        .numpy()
        .astype(np.float32)
    )

    faces = np.asarray(
        smpl_model.faces,
        dtype=np.int32,
    )

    if vertices.ndim != 2 or vertices.shape[1] != 3:
        raise ValueError(
            f"Invalid SMPL vertex shape: {vertices.shape}"
        )

    if joints.ndim != 2 or joints.shape[1] != 3:
        raise ValueError(
            f"Invalid SMPL joint shape: {joints.shape}"
        )

    if faces.ndim != 2 or faces.shape[1] != 3:
        raise ValueError(
            f"Invalid SMPL face shape: {faces.shape}"
        )

    if vertices.shape[0] == 0:
        raise ValueError(
            "Generated avatar has no vertices."
        )

    if faces.shape[0] == 0:
        raise ValueError(
            "Generated avatar has no faces."
        )

    if not np.isfinite(vertices).all():
        raise ValueError(
            "Generated avatar contains invalid vertex values."
        )

    if not np.isfinite(joints).all():
        raise ValueError(
            "Generated avatar contains invalid joint values."
        )

    return {
        "vertices": vertices,
        "faces": faces,
        "joints": joints,
        "body_model": validated_body_model,
        "device": str(torch_device),
    }