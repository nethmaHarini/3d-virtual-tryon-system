import numpy as np

from smpl_generator import (
    generate_smpl_avatar,
)


final_shape = np.array(
    [
        -2.6773,
        1.1714,
        0.2081,
        0.6909,
        0.0097,
        -0.6287,
        -1.7844,
        0.0252,
        0.5726,
        -0.3010,
    ],
    dtype=np.float32,
)


try:
    result = generate_smpl_avatar(
        shape_parameters=final_shape,
        body_model="female",
        device="cpu",
    )

    print("SMPL avatar generated.")
    print("Body model:", result["body_model"])
    print("Device:", result["device"])
    print("Vertices:", result["vertices"].shape)
    print("Faces:", result["faces"].shape)
    print("Joints:", result["joints"].shape)

except FileNotFoundError as error:
    print(error)
    print()
    print("SMPL generator code is ready, but model files are missing.")