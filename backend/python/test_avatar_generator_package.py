from pathlib import Path

from avatar_generator import generate_personalized_avatar


try:
    result = generate_personalized_avatar(
        front_path=Path("test_images/front.jpg"),
        side_path=Path("test_images/side.jpg"),
        back_path=Path("test_images/back.jpg"),
        height_cm=165,
        body_model="female",
        output_directory=Path("test_avatar_generator_output"),
        file_stem="package_test_avatar",
    )

    print("Avatar generator package completed.")

    for key, value in result.items():
        print(f"{key}: {value}")

except FileNotFoundError as error:
    print(error)
    print()
    print(
        "Avatar generator package is connected correctly, "
        "but the PARE/SMPL model files are missing."
    )

except Exception as error:
    print(
        f"{type(error).__name__}: {error}"
    )