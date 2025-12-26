from __future__ import annotations

from datetime import date, datetime
from pathlib import Path
from typing import Dict, Any, List, Tuple, Set
import json

import pandas as pd

from app.models.schemas import RowIssue

# /app/app/services/validation.py -> parents[3] = /app
BASE_DIR = Path(__file__).resolve().parents[3]
DATA_DIR = BASE_DIR / "data"


def _load_names(filename: str) -> Set[str]:
    path = DATA_DIR / filename
    if not path.exists():
        raise FileNotFoundError(
            f"Missing data file: {path}. Expected it under {DATA_DIR}."
        )

    with open(path, "r", encoding="utf-8") as f:
        items = json.load(f)

    return {str(x["name"]).strip() for x in items}


CATEGORIES = _load_names("categories.json")
DEPARTMENTS = _load_names("department.json")

# ✅ precalculado una vez
CATEGORIES_LC = {x.lower() for x in CATEGORIES}
DEPARTMENTS_LC = {x.lower() for x in DEPARTMENTS}


def _is_blank(value: Any) -> bool:
    return value is None or (isinstance(value, str) and value.strip() == "")


def _parse_date(value: Any) -> Tuple[date | None, str | None]:
    if value is None or pd.isna(value):
        return None, "Date is required"

    if isinstance(value, (datetime, pd.Timestamp)):
        return value.date(), None

    if isinstance(value, date):
        return value, None

    if isinstance(value, str):
        s = value.strip()
        for fmt in (
            "%Y-%m-%d",
            "%m-%d-%Y",
            "%m/%d/%Y",
            "%Y/%m/%d",
        ):
            try:
                return datetime.strptime(s, fmt).date(), None
            except ValueError:
                pass
        return None, "Invalid date format"

    return None, "Invalid date type"


def _norm(v: Any) -> str:
    return "" if v is None else str(v).strip()


def validate_row(row: Dict[str, Any]) -> List[RowIssue]:
    errors: List[RowIssue] = []

    # amount > 0
    amount = row.get("amount")
    try:
        amount_f = float(amount) if amount is not None and amount != "" else None
    except (TypeError, ValueError):
        amount_f = None

    if amount_f is None:
        errors.append(
            RowIssue(code="AMOUNT_INVALID", message="Amount must be a number")
        )
    elif amount_f <= 0:
        errors.append(
            RowIssue(code="AMOUNT_NON_POSITIVE", message="Amount must be > 0")
        )

    # currency == USD
    currency = _norm(row.get("currency")).upper()
    if _is_blank(currency):
        errors.append(
            RowIssue(code="CURRENCY_REQUIRED", message="Currency is required")
        )
    elif currency != "USD":
        errors.append(
            RowIssue(code="CURRENCY_NOT_USD", message="Currency must be 'USD'")
        )

    # description min 3 chars
    description = _norm(row.get("description"))
    if len(description) < 3:
        errors.append(
            RowIssue(
                code="DESCRIPTION_TOO_SHORT",
                message="Description must be at least 3 characters",
            )
        )

    # date not in future
    d, d_err = _parse_date(row.get("date"))
    if d_err:
        errors.append(RowIssue(code="DATE_INVALID", message=d_err))
    elif d > date.today():
        errors.append(
            RowIssue(code="DATE_IN_FUTURE", message="Future date not allowed")
        )

    # department allowed
    dept = _norm(row.get("department"))
    if _is_blank(dept):
        errors.append(
            RowIssue(code="DEPARTMENT_REQUIRED", message="Department is required")
        )
    elif dept.lower() not in DEPARTMENTS_LC:
        errors.append(
            RowIssue(code="DEPARTMENT_INVALID", message="Department is not allowed")
        )

    # category allowed
    cat = _norm(row.get("category"))
    if _is_blank(cat):
        errors.append(
            RowIssue(code="CATEGORY_REQUIRED", message="Category is required")
        )
    elif cat.lower() not in CATEGORIES_LC:
        errors.append(
            RowIssue(code="CATEGORY_INVALID", message="Category is not allowed")
        )

    return errors
