from pathlib import Path

import numpy as np
import trimesh

from exporter import export_avatar


vertices = np.array(
    [
        [-0.5, 0.0, -0.5],
        [0.5, 0.0, -0.5],
        [0.5, 0.0, 0.5],
        [-0.5, 0.0, 0.5],
        [0.0, 1.65, 0.0],
    ],
    dtype=np.float32,
)

faces = np.array(
    [
        [0, 1, 4],
        [1, 2, 4],
        [2, 3, 4],
        [3, 0, 4],
        [0, 3, 2],
        [0, 2, 1],
    ],
    dtype=np.int32,
)

output_directory = Path(
    "/workspaces/3d-virtual-tryon-system/backend/python/test_outputs"
)

generated_files = export_avatar(
    vertices=vertices,
    faces=faces,
    output_directory=output_directory,
    file_stem="test_avatar",
)

print("Generated files:")
print(generated_files)

for file_type, file_path in generated_files.items():
    path = Path(file_path)

    print(
        file_type.upper(),
        "exists:",
        path.exists(),
        "size:",
        path.stat().st_size,
        "bytes",
    )

obj_mesh = trimesh.load(
    generated_files["obj"],
    force="mesh",
)

glb_scene = trimesh.load(
    generated_files["glb"],
)

print()
print("OBJ vertices:", len(obj_mesh.vertices))
print("OBJ faces:", len(obj_mesh.faces))
print("GLB loaded successfully:", glb_scene is not None)

assert Path(generated_files["obj"]).exists()
assert Path(generated_files["glb"]).exists()
assert len(obj_mesh.vertices) == 5
assert len(obj_mesh.faces) == 6

print()
print("Avatar exporter test passed.")