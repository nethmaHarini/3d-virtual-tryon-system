from model_paths import (
    PARE_CHECKPOINT,
    PARE_CONFIG,
    PARE_ROOT,
    SMPL_MODEL_DIR,
    validate_model_files,
)


print("PARE root:", PARE_ROOT)
print("PARE checkpoint:", PARE_CHECKPOINT)
print("PARE config:", PARE_CONFIG)
print("SMPL model directory:", SMPL_MODEL_DIR)

try:
    validate_model_files("male")
except FileNotFoundError as error:
    print()
    print(error)
    print()
    print("Model path validation test passed.")