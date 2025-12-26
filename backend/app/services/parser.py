from __future__ import annotations

import io
from typing import List, Dict, Any
from fastapi import UploadFile
import pandas as pd

REQUIRED_COLUMNS = [
    "date",
    "amount",
    "currency",
    "department",
    "category",
    "description",
]


def _normalize_columns(cols: List[str]) -> List[str]:
    return [str(c).strip().lower() for c in cols]


async def parse_expenses_file(file: UploadFile) -> List[Dict[str, Any]]:
    """
    Devuelve una lista de dicts (una por fila) con llaves normalizadas:
    date, amount, currency, department, category, description
    """
    filename = (file.filename or "").lower()
    content = await file.read()

    if not content:
        raise ValueError("Empty file. Please upload a .csv or .xlsx with data.")

    try:
        if filename.endswith(".csv"):
            df = pd.read_csv(io.BytesIO(content))
        elif filename.endswith(".xlsx") or filename.endswith(".xls"):
            df = pd.read_excel(io.BytesIO(content))
        else:
            raise ValueError("Unsupported file type. Upload .csv or .xlsx")
    except Exception:
        raise ValueError("Failed to read file. Please verify the format and try again.")

    df.columns = _normalize_columns(list(df.columns))

    missing = [c for c in REQUIRED_COLUMNS if c not in df.columns]
    if missing:
        raise ValueError(
            f"Missing required columns: {', '.join(missing)}. Required: {', '.join(REQUIRED_COLUMNS)}"
        )

    df = df[REQUIRED_COLUMNS].copy()

    df = df.dropna(how="all")

    # Convertimos NaN a None para validaciones más limpias
    records = df.where(pd.notnull(df), None).to_dict(orient="records")
    return records
