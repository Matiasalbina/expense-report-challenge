from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import List, Any
from datetime import date, datetime

import pandas as pd

from app.services.parser import parse_expenses_file
from app.services.validation import validate_row
from app.models.schemas import (
    ValidateExpensesResponse,
    RowValidationResult,
    ExpenseRow,
)

router = APIRouter()


def _date_to_iso(value: Any) -> str:
    """
    Normaliza cualquier fecha a YYYY-MM-DD (o "" si no hay/ no se puede).
    Evita mandar "2025-01-15 00:00:00" al frontend, porque luego rompe en /reports/submit.
    """
    if value is None or pd.isna(value):
        return ""

    if isinstance(value, (pd.Timestamp, datetime)):
        return value.date().isoformat()

    if isinstance(value, date):
        return value.isoformat()

    if isinstance(value, str):
        s = value.strip()
        # Si viene con hora "YYYY-MM-DD HH:MM:SS", cortamos
        if len(s) >= 10 and s[4] == "-" and s[7] == "-":
            return s[:10]
        return s

    return ""


@router.post("/validate", response_model=ValidateExpensesResponse)
async def validate_expenses(file: UploadFile = File(...)):
    try:
        rows = await parse_expenses_file(file)
    except HTTPException:
        # parse_expenses_file ya lanza HTTPException con status_code/detail correctos
        raise
    except Exception:
        # Para cualquier error no esperado, evita filtrar internals
        raise HTTPException(status_code=500, detail="Failed to parse file")

    valid: List[RowValidationResult] = []
    invalid: List[RowValidationResult] = []

    for idx, row in enumerate(rows, start=1):
        errors = validate_row(row)

        # Normaliza amount de forma segura
        raw_amount = row.get("amount")
        try:
            amount = float(raw_amount) if raw_amount not in (None, "") else 0.0
        except (TypeError, ValueError):
            amount = 0.0

        data = ExpenseRow(
            date=_date_to_iso(row.get("date")),
            amount=amount,
            currency=str(row.get("currency") or "").upper(),
            department=str(row.get("department") or "").strip(),
            category=str(row.get("category") or "").strip(),
            description=str(row.get("description") or "").strip(),
        )

        result = RowValidationResult(row=idx, data=data, errors=errors, warnings=[])

        if errors:
            invalid.append(result)
        else:
            valid.append(result)

    return ValidateExpensesResponse(
        valid=valid,
        invalid=invalid,
        total_rows=len(rows),
        valid_rows=len(valid),
        invalid_rows=len(invalid),
    )
