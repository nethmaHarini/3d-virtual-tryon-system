from __future__ import annotations

import sys
from pathlib import Path
from types import SimpleNamespace
from typing import Dict

import joblib
import numpy as np

from model_paths import (
    PARE_CHECKPOINT,
    PARE_CONFIG,
    PARE_ROOT,
    validate_model_files,
)


REQUIRED_VIEWS = (
    "front",
    "side",
    "back",
)


class PAREInferenceRunner:
    """
    Initialize PARE and run inference for front, side, and back images.

    The PARE package and model files are loaded only when this class
    is created. This allows the rest of the backend to run even when
    the GPU model environment is unavailable.
    """

    def __init__(
        self,
        body_model: str,
    ) -> None:
        self.body_model = body_model.lower().strip()

        # Confirm that PARE, checkpoint, config, and SMPL files exist.
        self.model_paths = validate_model_files(
            self.body_model
        )

        if str(PARE_ROOT) not in sys.path:
            sys.path.insert(
                0,
                str(PARE_ROOT),
            )

        try:
            from pare.core.tester import PARETester
        except ImportError as error:
            raise ImportError(
                "PARE could not be imported. "
                f"Check the PARE installation at: {PARE_ROOT}"
            ) from error

        args = SimpleNamespace(
            cfg=str(PARE_CONFIG),
            ckpt=str(PARE_CHECKPOINT),

            detector=None,
            tracking_method="bbox",
            tracker_batch_size=1,
            display=False,
            yolo_img_size=416,
            staf_dir="",

            batch_size=1,
            smooth=False,
            min_cutoff=0.004,
            beta=0.7,

            no_render=True,
            no_save=False,
            wireframe=False,
            sideview=False,
            draw_keypoints=False,
            save_obj=False,
        )

        try:
            self.tester = PARETester(
                args
            )
        except Exception as error:
            raise RuntimeError(
                "PARE model initialization failed: "
                f"{type(error).__name__}: {error}"
            ) from error

    @staticmethod
    def validate_image_paths(
        image_paths: Dict[str, str | Path],
    ) -> Dict[str, Path]:
        """
        Validate the front, side, and back image paths.
        """
        validated_paths: Dict[str, Path] = {}

        for view in REQUIRED_VIEWS:
            if view not in image_paths:
                raise KeyError(
                    f"Missing {view} image path."
                )

            path = Path(
                image_paths[view]
            ).resolve()

            if not path.exists():
                raise FileNotFoundError(
                    f"{view.capitalize()} image not found: {path}"
                )

            if path.suffix.lower() not in {
                ".jpg",
                ".jpeg",
                ".png",
            }:
                raise ValueError(
                    f"Unsupported {view} image format: {path.suffix}"
                )

            validated_paths[view] = path

        return validated_paths

    @staticmethod
    def prepare_detections(
        detections: Dict[str, dict],
    ) -> list[np.ndarray]:
        """
        Convert the three person-detector bounding boxes into
        the ordered list required by PARE.
        """
        ordered_detections = []

        for view in REQUIRED_VIEWS:
            if view not in detections:
                raise KeyError(
                    f"Missing person detection for {view}."
                )

            if "box" not in detections[view]:
                raise KeyError(
                    f"Bounding box missing for {view}."
                )

            bounding_box = np.asarray(
                detections[view]["box"],
                dtype=np.float32,
            ).reshape(1, 4)

            if not np.isfinite(
                bounding_box
            ).all():
                raise ValueError(
                    f"{view} bounding box contains invalid values."
                )

            ordered_detections.append(
                bounding_box
            )

        return ordered_detections

    def run(
        self,
        image_directory: str | Path,
        output_directory: str | Path,
        detections: Dict[str, dict],
    ) -> Dict[str, dict]:
        """
        Run PARE inference and load the three generated result files.

        The image directory must contain:
            front.jpg/jpeg/png
            side.jpg/jpeg/png
            back.jpg/jpeg/png
        """
        image_dir = Path(
            image_directory
        ).resolve()

        output_dir = Path(
            output_directory
        ).resolve()

        if not image_dir.exists():
            raise FileNotFoundError(
                f"Image directory not found: {image_dir}"
            )

        output_dir.mkdir(
            parents=True,
            exist_ok=True,
        )

        pare_results_dir = (
            output_dir / "pare_results"
        )

        pare_results_dir.mkdir(
            parents=True,
            exist_ok=True,
        )

        image_paths = {}

        for view in REQUIRED_VIEWS:
            matching_files = [
                path
                for path in image_dir.iterdir()
                if (
                    path.is_file()
                    and path.stem.lower() == view
                    and path.suffix.lower()
                    in {".jpg", ".jpeg", ".png"}
                )
            ]

            if len(matching_files) != 1:
                raise RuntimeError(
                    f"Expected exactly one {view} image, "
                    f"but found {len(matching_files)}."
                )

            image_paths[view] = matching_files[0]

        self.validate_image_paths(
            image_paths
        )

        ordered_detections = self.prepare_detections(
            detections
        )

        try:
            self.tester.run_on_image_folder(
                image_folder=str(image_dir),
                detections=ordered_detections,
                output_path=str(output_dir),
                output_img_folder=str(output_dir),
                bbox_scale=1.0,
                run_smplify=False,
            )
        except Exception as error:
            raise RuntimeError(
                "PARE inference failed: "
                f"{type(error).__name__}: {error}"
            ) from error

        pare_data: Dict[str, dict] = {}

        for view in REQUIRED_VIEWS:
            result_file = (
                pare_results_dir / f"{view}.pkl"
            )

            if not result_file.exists():
                raise FileNotFoundError(
                    f"PARE result was not generated: {result_file}"
                )

            pare_data[view] = joblib.load(
                result_file
            )

        return pare_data