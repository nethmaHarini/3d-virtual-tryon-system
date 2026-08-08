from pare_runner import PAREInferenceRunner


try:
    runner = PAREInferenceRunner(
        body_model="female"
    )

    print("PARE runner initialized successfully.")

except FileNotFoundError as error:
    print(error)
    print()
    print(
        "PARE runner code is ready, "
        "but the PARE and SMPL model files are missing."
    )

except ImportError as error:
    print(error)
    print()
    print(
        "PARE runner code is ready, "
        "but the PARE repository is unavailable."
    )