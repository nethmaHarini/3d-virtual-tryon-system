from __future__ import annotations

import os
from pathlib import Path


PROJECT_PYTHON_DIR = Path(__file__).resolve().parent

PARE_ROOT = Path(
    os.getenv(
        "PARE_ROOT",
        PROJECT_PYTHON_DIR / "models" / "PARE",
    )
).resolve()

PARE_CHECKPOINT = Path(
    os.getenv(
        "PARE_CHECKPOINT",
        PARE_ROOT / "data" / "pare" / "checkpoints" / "pare_checkpoint.ckpt",
    )
).resolve()

PARE_CONFIG = Path(
    os.getenv(
        "PARE_CONFIG",
        PARE_ROOT / "data" / "pare" / "checkpoints" / "pare_config.yaml",
    )
).resolve()

SMPL_MODEL_DIR = Path(
    os.getenv(
        "SMPL_MODEL_DIR",
        PARE_ROOT / "data" / "body_models" / "smpl",
    )
).resolve()


def get_smpl_model_path(gender: str) -> Path:
    normalized_gender = gender.lower().strip()

    model_names = {
        "male": "SMPL_MALE.pkl",
        "female": "SMPL_FEMALE.pkl",
        "neutral": "SMPL_NEUTRAL.pkl",
    }

    if normalized_gender not in model_names:
        raise ValueError(
            "Gender must be male, female, or neutral."
        )

    return SMPL_MODEL_DIR / model_names[normalized_gender]


def validate_model_files(gender: str) -> dict:
    smpl_model_path = get_smpl_model_path(gender)

    required_paths = {
        "pare_root": PARE_ROOT,
        "pare_checkpoint": PARE_CHECKPOINT,
        "pare_config": PARE_CONFIG,
        "smpl_model": smpl_model_path,
    }

    missing_paths = {
        name: str(path)
        for name, path in required_paths.items()
        if not path.exists()
    }

    if missing_paths:
        missing_text = "\n".join(
            f"- {name}: {path}"
            for name, path in missing_paths.items()
        )

        raise FileNotFoundError(
            "Required PARE/SMPL files are missing:\n"
            + missing_text
        )

    return {
        name: str(path)
        for name, path in required_paths.items()
    }