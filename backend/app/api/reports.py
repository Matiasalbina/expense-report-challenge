from fastapi import APIRouter, HTTPException
from app.models.schemas import ReportSubmitRequest, ReportSummary, ReportDetail
from app.services.reports_service import submit_report, get_reports, get_report_by_id
from app.services.validation import validate_row

router = APIRouter()


@router.get("/ping")
def ping():
    return "pong"


@router.get("", response_model=list[ReportSummary])
def list_all_reports():
    return get_reports()


@router.post("/submit", response_model=ReportDetail)
def submit(req: ReportSubmitRequest):
    # ✅ Validar business rules en backend (manual y bulk)
    invalid_rows = []
    expenses_dump = []

    for idx, e in enumerate(req.expenses, start=1):
        data = e.model_dump()
        row_errors = validate_row(data)

        if row_errors:
            invalid_rows.append(
                {
                    "row": idx,
                    "errors": [err.model_dump() for err in row_errors],
                    "data": data,
                }
            )
        else:
            expenses_dump.append(data)

    if invalid_rows:
        raise HTTPException(
            status_code=400,
            detail={
                "message": "Invalid expenses. Fix or remove invalid rows before submitting.",
                "invalid": invalid_rows,
                "valid_count": len(expenses_dump),
                "invalid_count": len(invalid_rows),
            },
        )

    report = submit_report(expenses_dump)
    return report


@router.get("/{report_id}", response_model=ReportDetail)
def detail(report_id: str):
    report = get_report_by_id(report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return report
