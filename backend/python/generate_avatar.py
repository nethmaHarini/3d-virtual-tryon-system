from __future__ import annotations

import argparse
import json
import os
import shutil
import sys
from pathlib import Path


ALLOWED_BODY_MODELS = {
    "male",
    "female",
    "neutral",
}

MIN_HEIGHT_CM = 100.0
MAX_HEIGHT_CM = 230.0


def validate_height(height_value: str) -> float:
    """
    Validate user height in centimetres.
    """
    try:
        height = float(height_value)
    except (TypeError, ValueError) as error:
        raise ValueError(
            "Height must be a numeric value."
        ) from error

    if not MIN_HEIGHT_CM <= height <= MAX_HEIGHT_CM:
        raise ValueError(
            f"Height must be between "
            f"{MIN_HEIGHT_CM:.0f} cm and "
            f"{MAX_HEIGHT_CM:.0f} cm."
        )

    return height


def validate_body_model(body_model_value: str) -> str:
    """
    Validate the selected SMPL body model.
    """
    body_model = body_model_value.lower().strip()

    if body_model not in ALLOWED_BODY_MODELS:
        raise ValueError(
            "Body model must be male, female, or neutral."
        )

    return body_model


def validate_image(
    image_path: str,
    view_name: str,
) -> Path:
    """
    Validate one uploaded image.
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

    if path.suffix.lower() not in {
        ".jpg",
        ".jpeg",
        ".png",
    }:
        raise ValueError(
            f"Unsupported {view_name} image format: {path.suffix}"
        )

    return path


def generate_sample_avatar(
    sample_obj: Path,
    output_path: Path,
) -> dict:
    """
    Temporary fallback used in Codespaces.
    """
    if not sample_obj.exists():
        raise FileNotFoundError(
            f"Sample OBJ not found: {sample_obj}"
        )

    output_path.parent.mkdir(
        parents=True,
        exist_ok=True,
    )

    shutil.copyfile(
        sample_obj,
        output_path,
    )

    return {
        "obj": str(output_path),
        "glb": None,
        "mode": "sample",
    }


def generate_real_avatar(
    front: Path,
    side: Path,
    back: Path,
    height: float,
    body_model: str,
    output_path: Path,
) -> dict:
    """
    Run the real PARE + SMPL avatar pipeline.
    """
    # Import only when real mode is requested.
    from avatar_generator import generate_personalized_avatar

    output_path.parent.mkdir(
        parents=True,
        exist_ok=True,
    )

    result = generate_personalized_avatar(
        front_path=front,
        side_path=side,
        back_path=back,
        height_cm=height,
        body_model=body_model,
        output_directory=output_path.parent,
        file_stem=output_path.stem,
    )

    generated_obj = Path(
        result["obj"]
    ).resolve()

    requested_output = output_path.resolve()

    if generated_obj != requested_output:
        shutil.copyfile(
            generated_obj,
            requested_output,
        )

    result["obj"] = str(requested_output)
    result["mode"] = "real"

    return result


def main() -> None:
    parser = argparse.ArgumentParser(
        description=(
            "Generate a personalized 3D avatar from "
            "front, side, and back photographs."
        )
    )

    parser.add_argument(
        "--front",
        required=True,
    )

    parser.add_argument(
        "--side",
        required=True,
    )

    parser.add_argument(
        "--back",
        required=True,
    )

    parser.add_argument(
        "--height",
        required=True,
    )

    parser.add_argument(
        "--body_model",
        required=True,
    )

    parser.add_argument(
        "--output",
        required=True,
    )

    parser.add_argument(
        "--sample_obj",
        required=True,
    )

    args = parser.parse_args()

    try:
        front = validate_image(
            args.front,
            "front",
        )

        side = validate_image(
            args.side,
            "side",
        )

        back = validate_image(
            args.back,
            "back",
        )

        height = validate_height(
            args.height
        )

        body_model = validate_body_model(
            args.body_model
        )

        output_path = Path(
            args.output
        ).resolve()

        sample_obj = Path(
            args.sample_obj
        ).resolve()

        avatar_mode = os.getenv(
            "AVATAR_MODE",
            "sample",
        ).lower().strip()

        if avatar_mode == "real":
            generation_result = generate_real_avatar(
                front=front,
                side=side,
                back=back,
                height=height,
                body_model=body_model,
                output_path=output_path,
            )

        elif avatar_mode == "sample":
            generation_result = generate_sample_avatar(
                sample_obj=sample_obj,
                output_path=output_path,
            )

        else:
            raise ValueError(
                "AVATAR_MODE must be either 'sample' or 'real'."
            )

        response = {
            "success": True,
            "message": "Avatar generated successfully.",
            "output_file": generation_result["obj"],
            "glb_output_file": generation_result.get("glb"),
            "mode": generation_result["mode"],
            "height_cm": height,
            "body_model": body_model,
        }

        print(
            json.dumps(response)
        )

        sys.exit(0)

    except Exception as error:
        response = {
            "success": False,
            "message": str(error),
            "error_type": type(error).__name__,
        }

        print(
            json.dumps(response)
        )

        sys.exit(1)


if __name__ == "__main__":
    main()