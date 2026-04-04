import argparse
import json
import shutil
import sys
import time
from pathlib import Path


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--front", required=True)
    parser.add_argument("--back", required=True)
    parser.add_argument("--side", required=True)
    parser.add_argument("--height", required=True)
    parser.add_argument("--output", required=True)
    parser.add_argument("--sample_obj", required=True)
    args = parser.parse_args()

    try:
        front = Path(args.front)
        back = Path(args.back)
        side = Path(args.side)
        output = Path(args.output)
        sample_obj = Path(args.sample_obj)

        if not front.exists():
            raise FileNotFoundError(f"Front image not found: {front}")
        if not back.exists():
            raise FileNotFoundError(f"Back image not found: {back}")
        if not side.exists():
            raise FileNotFoundError(f"Side image not found: {side}")
        if not sample_obj.exists():
            raise FileNotFoundError(f"Sample OBJ not found: {sample_obj}")

        output.parent.mkdir(parents=True, exist_ok=True)

        time.sleep(2)

        shutil.copyfile(sample_obj, output)

        print(json.dumps({
            "success": True,
            "output_file": str(output),
            "message": "Avatar generated successfully"
        }))
        sys.exit(0)

    except Exception as e:
        print(json.dumps({
            "success": False,
            "message": str(e)
        }))
        sys.exit(1)


if __name__ == "__main__":
    main()
