import numpy as np

from avatar_generator.postprocess import (
    create_avatar_from_pare_results,
)


pare_data = {
    "front": {
        "pred_shape": np.array(
            [[
                -2.6242,
                1.1714,
                0.0709,
                0.2967,
                -0.2606,
                -0.3990,
                -1.7844,
                0.0252,
                0.6276,
                -0.3220,
            ]],
            dtype=np.float32,
        )
    },
    "side": {
        "pred_shape": np.array(
            [[
                -2.6773,
                0.8754,
                0.2081,
                0.8512,
                0.2785,
                -0.6850,
                -1.7539,
                0.0611,
                0.4726,
                -0.1803,
            ]],
            dtype=np.float32,
        )
    },
    "back": {
        "pred_shape": np.array(
            [[
                -3.1750,
                1.3025,
                0.2737,
                0.6909,
                0.0097,
                -0.6287,
                -1.9988,
                -0.0161,
                0.5726,
                -0.3010,
            ]],
            dtype=np.float32,
        )
    },
}


try:
    result = create_avatar_from_pare_results(
        pare_data=pare_data,
        body_model="female",
        height_cm=165,
        output_directory="test_postprocess_output",
        file_stem="female_test_avatar",
    )

    print("Avatar post-processing completed.")

    for key, value in result.items():
        print(f"{key}: {value}")

except FileNotFoundError as error:
    print(error)
    print()
    print(
        "Post-processing connection is correct, "
        "but the SMPL model files are missing."
    )