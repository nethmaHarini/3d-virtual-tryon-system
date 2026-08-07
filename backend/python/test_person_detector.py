from pathlib import Path

from person_detector import PersonDetector


front_path = Path("test_images/front.jpg")
side_path = Path("test_images/side.jpg")
back_path = Path("test_images/back.jpg")

for path in [
    front_path,
    side_path,
    back_path,
]:
    if not path.exists():
        raise FileNotFoundError(
            f"Missing test image: {path}"
        )

detector = PersonDetector()

detections = detector.detect_three_views(
    front_path=front_path,
    side_path=side_path,
    back_path=back_path,
)

for view, result in detections.items():
    print()
    print(view.upper())
    print("Path:", result["image_path"])
    print("Box:", result["box"])
    print("Confidence:", round(result["score"], 4))

print()
print("Person detection test passed.")