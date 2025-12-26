from app.storage import store


def submit_report(expenses: list[dict]) -> dict:
    # aquí puedes reforzar: currency USD, amount > 0, etc.
    return store.add_report(expenses)


def get_reports() -> list[dict]:
    return store.list_reports()


def get_report_by_id(report_id: str) -> dict | None:
    return store.get_report(report_id)
