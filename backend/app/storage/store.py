from typing import Dict, Any, List
from uuid import uuid4
from datetime import datetime

REPORTS: List[Dict[str, Any]] = []


def add_report(expenses: list[dict]) -> dict:
    report_id = str(uuid4())
    total = sum(float(e.get("amount", 0) or 0) for e in expenses)

    report = {
        "id": report_id,
        "created_at": datetime.utcnow().isoformat(),
        "currency": "USD",
        "total_amount": total,
        "items_count": len(expenses),
        "expenses": expenses,
    }

    REPORTS.append(report)
    return report


def list_reports() -> list[dict]:
    return [
        {
            k: r[k]
            for k in ("id", "created_at", "currency", "total_amount", "items_count")
        }
        for r in REPORTS
    ]


def get_report(report_id: str) -> dict | None:
    for r in REPORTS:
        if r["id"] == report_id:
            return r
    return None
