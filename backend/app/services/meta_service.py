import json
from pathlib import Path
from typing import List
from app.models.schemas import OptionItem

# Queremos llegar a: expense-report-challenge/data
ROOT_DIR = Path(__file__).resolve().parents[3]
DATA_DIR = ROOT_DIR / "data"


def _read_json(filename: str):
    path = DATA_DIR / filename
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def get_categories() -> List[OptionItem]:
    return [OptionItem(**x) for x in _read_json("categories.json")]


def get_departments() -> List[OptionItem]:
    return [OptionItem(**x) for x in _read_json("department.json")]
