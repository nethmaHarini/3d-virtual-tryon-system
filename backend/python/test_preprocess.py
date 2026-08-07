from pathlib import Path

from avatar_generator.preprocess import (
    prepare_three_view_images,
)


result = prepare_three_view_images(
    front_path=Path("test_images/front.jpg"),
    side_path=Path("test_images/side.jpg"),
    back_path=Path("test_images/back.jpg"),
    output_directory=Path("test_preprocess_output"),
)

print("Prepared images:")

for view, path in result.items():
    print(
        view,
        "->",
        path,
        "| exists:",
        path.exists(),
    )

assert set(result.keys()) == {
    "front",
    "side",
    "back",
}

assert all(
    path.exists()
    for path in result.values()
)

print()
print("Preprocessing test passed.")