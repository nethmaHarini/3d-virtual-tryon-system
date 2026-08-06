import numpy as np

from shape_fusion import (
    extract_shape_predictions,
    fuse_shapes,
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
            ]]
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
            ]]
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
            ]]
        )
    },
}


predictions = extract_shape_predictions(
    pare_data
)

final_shape = fuse_shapes(
    predictions
)

print("Front:", predictions["front"])
print("Side:", predictions["side"])
print("Back:", predictions["back"])
print()
print("Final fused shape:")
print(np.round(final_shape, 4))
print()
print("Shape:", final_shape.shape)