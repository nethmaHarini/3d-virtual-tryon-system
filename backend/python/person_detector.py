from __future__ import annotations

from pathlib import Path
from typing import Dict

import cv2
import numpy as np
import torch
from PIL import Image
from torchvision.models.detection import (
    FasterRCNN_ResNet50_FPN_Weights,
    fasterrcnn_resnet50_fpn,
)


PERSON_CLASS_ID = 1
DEFAULT_CONFIDENCE_THRESHOLD = 0.50
DEFAULT_MARGIN_RATIO = 0.05


class PersonDetector:
    """
    Detect the main person in front, side, and back images.

    This module is based on the working Faster R-CNN
    person-detection code from the Colab notebook.
    """

    def __init__(
        self,
        confidence_threshold: float = DEFAULT_CONFIDENCE_THRESHOLD,
        margin_ratio: float = DEFAULT_MARGIN_RATIO,
        device: str | None = None,
    ) -> None:
        if not 0.0 < confidence_threshold <= 1.0:
            raise ValueError(
                "Confidence threshold must be between 0 and 1."
            )

        if not 0.0 <= margin_ratio <= 0.5:
            raise ValueError(
                "Margin ratio must be between 0 and 0.5."
            )

        self.confidence_threshold = confidence_threshold
        self.margin_ratio = margin_ratio

        if device is None:
            self.device = torch.device(
                "cuda" if torch.cuda.is_available() else "cpu"
            )
        else:
            self.device = torch.device(device)

        self.weights = FasterRCNN_ResNet50_FPN_Weights.DEFAULT

        self.model = fasterrcnn_resnet50_fpn(
            weights=self.weights
        ).to(self.device)

        self.model.eval()

        self.preprocess = self.weights.transforms()

    def detect_main_person(
        self,
        image_path: str | Path,
    ) -> Dict[str, object]:
        """
        Detect the largest valid person in one image.

        Returns:
            {
                "image_path": str,
                "box": np.ndarray([x1, y1, x2, y2]),
                "score": float,
                "width": int,
                "height": int
            }
        """
        path = Path(image_path)

        if not path.exists():
            raise FileNotFoundError(
                f"Image not found: {path}"
            )

        image_bgr = cv2.imread(
            str(path)
        )

        if image_bgr is None:
            raise ValueError(
                f"Could not read image: {path}"
            )

        image_rgb = cv2.cvtColor(
            image_bgr,
            cv2.COLOR_BGR2RGB,
        )

        image_pil = Image.fromarray(
            image_rgb
        )

        image_tensor = self.preprocess(
            image_pil
        ).to(self.device)

        with torch.no_grad():
            prediction = self.model(
                [image_tensor]
            )[0]

        boxes = (
            prediction["boxes"]
            .detach()
            .cpu()
            .numpy()
        )

        labels = (
            prediction["labels"]
            .detach()
            .cpu()
            .numpy()
        )

        scores = (
            prediction["scores"]
            .detach()
            .cpu()
            .numpy()
        )

        person_candidates = []

        for box, label, score in zip(
            boxes,
            labels,
            scores,
        ):
            if (
                int(label) == PERSON_CLASS_ID
                and float(score) >= self.confidence_threshold
            ):
                x1, y1, x2, y2 = box

                width = max(
                    0.0,
                    float(x2 - x1),
                )

                height = max(
                    0.0,
                    float(y2 - y1),
                )

                area = width * height

                person_candidates.append(
                    {
                        "box": box,
                        "score": float(score),
                        "area": float(area),
                    }
                )

        if not person_candidates:
            raise RuntimeError(
                f"No person was detected in {path.name}."
            )

        main_person = max(
            person_candidates,
            key=lambda candidate: candidate["area"],
        )

        x1, y1, x2, y2 = main_person["box"]

        image_height, image_width = image_rgb.shape[:2]

        box_width = float(x2 - x1)
        box_height = float(y2 - y1)

        margin_x = (
            box_width * self.margin_ratio
        )

        margin_y = (
            box_height * self.margin_ratio
        )

        x1 = max(
            0.0,
            float(x1 - margin_x),
        )

        y1 = max(
            0.0,
            float(y1 - margin_y),
        )

        x2 = min(
            float(image_width - 1),
            float(x2 + margin_x),
        )

        y2 = min(
            float(image_height - 1),
            float(y2 + margin_y),
        )

        final_box = np.array(
            [x1, y1, x2, y2],
            dtype=np.float32,
        )

        return {
            "image_path": str(path.resolve()),
            "box": final_box,
            "score": float(main_person["score"]),
            "width": int(image_width),
            "height": int(image_height),
        }

    def detect_three_views(
        self,
        front_path: str | Path,
        side_path: str | Path,
        back_path: str | Path,
    ) -> Dict[str, Dict[str, object]]:
        """
        Detect the main person in all three required views.
        """
        detections = {
            "front": self.detect_main_person(
                front_path
            ),
            "side": self.detect_main_person(
                side_path
            ),
            "back": self.detect_main_person(
                back_path
            ),
        }

        return detections