import numpy as np

from mesh_utils import (
    calculate_bounds,
    calculate_mesh_height,
    normalize_avatar,
)


# Simple test mesh.
test_vertices = np.array(
    [
        [-0.5, -1.0, -0.2],
        [0.5, -1.0, -0.2],
        [-0.4, 1.0, 0.2],
        [0.4, 1.0, 0.2],
    ],
    dtype=np.float32,
)

user_height_cm = 165.0

normalized_vertices, scale_factor = normalize_avatar(
    test_vertices,
    user_height_cm,
)

minimum_coordinates, maximum_coordinates = calculate_bounds(
    normalized_vertices
)

final_height_m = calculate_mesh_height(
    normalized_vertices
)

print("Original vertices:")
print(test_vertices)

print()
print("Normalized vertices:")
print(normalized_vertices)

print()
print("Scale factor:", round(scale_factor, 4))
print("Minimum XYZ:", minimum_coordinates)
print("Maximum XYZ:", maximum_coordinates)
print("Final height:", round(final_height_m, 4), "m")

assert abs(final_height_m - 1.65) < 0.001
assert abs(float(minimum_coordinates[1])) < 0.001

print()
print("Mesh normalization test passed.")