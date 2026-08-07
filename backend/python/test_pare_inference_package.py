from pathlib import Path

from avatar_generator.pare_inference import (
    run_pare_inference,
)


try:
    result = run_pare_inference(
        image_directory=Path("test_images"),
        output_directory=Path("test_pare_package_output"),
        detections={
            "front": {
                "box": [89.13, 0.0, 287.40, 669.0]
            },
            "side": {
                "box": [131.75, 0.0, 273.24, 674.0]
            },
            "back": {
                "box": [94.87, 0.0, 292.81, 676.0]
            },
        },
        body_model="female",
    )

    print("PARE package inference completed.")
    print(result.keys())

except FileNotFoundError as error:
    print(error)
    print()
    print(
        "PARE package connection is correct, "
        "but model files are missing."
    )