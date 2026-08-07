from pathlib import Path

from avatar_pipeline import generate_avatar_pipeline


try:
    result = generate_avatar_pipeline(
        front_path=Path("test_images/front.jpg"),
        side_path=Path("test_images/side.jpg"),
        back_path=Path("test_images/back.jpg"),
        height_cm=165,
        body_model="female",
        output_directory=Path("pipeline_test_output"),
        file_stem="female_test_avatar",
    )

    print("Avatar pipeline completed successfully.")

    for key, value in result.items():
        print(f"{key}: {value}")

except FileNotFoundError as error:
    print(error)
    print()
    print(
        "Avatar pipeline structure is ready, "
        "but the PARE/SMPL model files are unavailable."
    )

except Exception as error:
    print(
        f"{type(error).__name__}: {error}"
    )