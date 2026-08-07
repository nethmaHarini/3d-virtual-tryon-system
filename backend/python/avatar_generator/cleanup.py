from __future__ import annotations

import shutil
from pathlib import Path


def remove_directory(directory: str | Path) -> None:
    """
    Safely remove a temporary processing directory.
    """
    path = Path(directory)

    if path.exists() and path.is_dir():
        shutil.rmtree(
            path,
            ignore_errors=True,
        )


def remove_file(file_path: str | Path) -> None:
    """
    Safely remove a temporary uploaded file.
    """
    path = Path(file_path)

    if path.exists() and path.is_file():
        try:
            path.unlink()
        except OSError:
            pass


def cleanup_uploaded_images(
    front_path: str | Path,
    side_path: str | Path,
    back_path: str | Path,
) -> None:
    """
    Delete uploaded body images after avatar processing.
    """
    for image_path in (
        front_path,
        side_path,
        back_path,
    ):
        remove_file(image_path)