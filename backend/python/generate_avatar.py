import argparse
import json
import shutil
import sys
import time
from pathlib import Path


def validate_height(height_value: str) -> float:
    """
    Convert the height value to float and validate the allowed range.
    """
    try:
        height = float(height_value)
    except ValueError as error:
        raise ValueError("Height must be a numeric value.") from error

    if height < 100 or height > 230:
        raise ValueError("Height must be between 100 cm and 230 cm.")

    return height


def validate_body_model(body_model_value: str) -> str:
    """
    Validate the selected SMPL body model.
    """
    body_model = body_model_value.lower().strip()

    allowed_models = {
        "male",
        "female",
        "neutral",
    }

    if body_model not in allowed_models:
        raise ValueError(
            "Body model must be male, female, or neutral."
        )

    return body_model


def main():
    parser = argparse.ArgumentParser()

    parser.add_argument(
        "--front",
        required=True,
        help="Path to the front-view image.",
    )

    parser.add_argument(
        "--back",
        required=True,
        help="Path to the back-view image.",
    )

    parser.add_argument(
        "--side",
        required=True,
        help="Path to the side-view image.",
    )

    parser.add_argument(
        "--height",
        required=True,
        help="User height in centimetres.",
    )

    parser.add_argument(
        "--body_model",
        required=True,
        help="SMPL body model: male, female, or neutral.",
    )

    parser.add_argument(
        "--output",
        required=True,
        help="Path where the generated avatar will be saved.",
    )

    parser.add_argument(
        "--sample_obj",
        required=True,
        help="Temporary sample OBJ file used until the real pipeline is connected.",
    )

    args = parser.parse_args()

    try:
        front = Path(args.front)
        back = Path(args.back)
        side = Path(args.side)
        output = Path(args.output)
        sample_obj = Path(args.sample_obj)

        height = validate_height(args.height)
        body_model = validate_body_model(args.body_model)

        if not front.exists():
            raise FileNotFoundError(
                f"Front image not found: {front}"
            )

        if not back.exists():
            raise FileNotFoundError(
                f"Back image not found: {back}"
            )

        if not side.exists():
            raise FileNotFoundError(
                f"Side image not found: {side}"
            )

        if not sample_obj.exists():
            raise FileNotFoundError(
                f"Sample OBJ not found: {sample_obj}"
            )

        output.parent.mkdir(
            parents=True,
            exist_ok=True,
        )

        # -------------------------------------------------
        # Temporary placeholder
        # -------------------------------------------------
        # This still copies the sample avatar.
        # Later, we will replace this block with the real
        # PARE + SMPL avatar-generation pipeline.
        # -------------------------------------------------

        time.sleep(2)

        shutil.copyfile(
            sample_obj,
            output,
        )

        result = {
            "success": True,
            "output_file": str(output),
            "message": "Avatar generated successfully",
            "height_cm": height,
            "body_model": body_model,
        }

        print(json.dumps(result))
        sys.exit(0)

    except Exception as error:
        result = {
            "success": False,
            "message": str(error),
        }

        print(json.dumps(result))
        sys.exit(1)


if __name__ == "__main__":
    main()