from pathlib import Path

from avatar_generator.cleanup import (
    cleanup_uploaded_images,
)


test_directory = Path("cleanup_test")

test_directory.mkdir(
    exist_ok=True
)

front = test_directory / "front.jpg"
side = test_directory / "side.jpg"
back = test_directory / "back.jpg"

front.write_bytes(b"test")
side.write_bytes(b"test")
back.write_bytes(b"test")

print("Before cleanup:")

print("Front exists:", front.exists())
print("Side exists:", side.exists())
print("Back exists:", back.exists())

cleanup_uploaded_images(
    front_path=front,
    side_path=side,
    back_path=back,
)

print()
print("After cleanup:")

print("Front exists:", front.exists())
print("Side exists:", side.exists())
print("Back exists:", back.exists())

assert not front.exists()
assert not side.exists()
assert not back.exists()

test_directory.rmdir()

print()
print("Cleanup test passed.")