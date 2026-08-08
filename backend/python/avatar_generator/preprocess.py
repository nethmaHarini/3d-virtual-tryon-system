from __future__ import annotations

import shutil
from pathlib import Path
from typing import Dict


SUPPORTED_IMAGE_FORMATS = {
    ".jpg",
    ".jpeg",
    ".png",
}

REQUIRED_VIEWS = (
    "front",
    "side",
    "back",
)


def validate_image(
    image_path: str | Path,
    view_name: str,
) -> Path:
    """
    Validate one uploaded user image.
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

    if path.stat().st_size == 0:
        raise ValueError(
            f"{view_name.capitalize()} image is empty."
        )

    return path


def prepare_three_view_images(
    front_path: str | Path,
    side_path: str | Path,
    back_path: str | Path,
    output_directory: str | Path,
) -> Dict[str, Path]:
    """
    Validate and copy the three required body images into
    a clean processing directory.

    The files are renamed consistently as:
        front.jpg/jpeg/png
        side.jpg/jpeg/png
        back.jpg/jpeg/png
    """
    destination_directory = Path(
        output_directory
    ).resolve()

    if destination_directory.exists():
        shutil.rmtree(
            destination_directory
        )

    destination_directory.mkdir(
        parents=True,
        exist_ok=True,
    )

    source_images = {
        "front": validate_image(
            front_path,
            "front",
        ),
        "side": validate_image(
            side_path,
            "side",
        ),
        "back": validate_image(
            back_path,
            "back",
        ),
    }

    prepared_images: Dict[str, Path] = {}

    for view in REQUIRED_VIEWS:
        source_path = source_images[view]

        destination_path = (
            destination_directory
            / f"{view}{source_path.suffix.lower()}"
        )

        shutil.copy2(
            source_path,
            destination_path,
        )

        prepared_images[view] = destination_path

    return prepared_images