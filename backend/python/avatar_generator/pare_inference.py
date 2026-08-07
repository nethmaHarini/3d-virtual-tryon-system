from __future__ import annotations

from pathlib import Path
from typing import Dict

from pare_runner import PAREInferenceRunner


def run_pare_inference(
    image_directory: str | Path,
    output_directory: str | Path,
    detections: Dict[str, dict],
    body_model: str,
) -> Dict[str, dict]:
    """
    Run PARE inference for front, side, and back images.

    This function uses the existing tested PAREInferenceRunner.
    """
    runner = PAREInferenceRunner(
        body_model=body_model
    )

    pare_data = runner.run(
        image_directory=image_directory,
        output_directory=output_directory,
        detections=detections,
    )

    return pare_data