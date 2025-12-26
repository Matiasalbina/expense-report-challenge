from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from uuid import UUID


# =====================
# AUTH
# =====================


class LoginRequest(BaseModel):
    email: str
    password: str = Field(min_length=1)


class LoginResponse(BaseModel):
    token: str


# =====================
# META
# =====================


class OptionItem(BaseModel):
    id: int
    name: str


# =====================
# EXPENSES / VALIDATION
# =====================


class ExpenseRow(BaseModel):
    date: str
    amount: float
    currency: str
    department: str
    category: str
    description: str


class RowIssue(BaseModel):
    code: str
    message: str


class RowValidationResult(BaseModel):
    row: int
    data: Optional[ExpenseRow] = None
    errors: List[RowIssue] = Field(default_factory=list)
    warnings: List[RowIssue] = Field(default_factory=list)


class ValidateExpensesResponse(BaseModel):
    valid: List[RowValidationResult]
    invalid: List[RowValidationResult]
    total_rows: int
    valid_rows: int
    invalid_rows: int


# =====================
# REPORTS
# =====================


class ExpenseItem(BaseModel):
    date: str
    amount: float
    currency: str
    department: str
    category: str
    description: str


class ReportSubmitRequest(BaseModel):
    expenses: List[ExpenseItem]


class ReportSummary(BaseModel):
    id: str
    created_at: str
    total_amount: float
    currency: str = "USD"
    items_count: int


class ReportDetail(ReportSummary):
    expenses: List[ExpenseItem]


class ReportSubmitRequest(BaseModel):
    expenses: List[ExpenseRow]


class ReportResponse(BaseModel):
    id: UUID
    created_at: datetime
    total_amount: float
    currency: str
    items_count: int
    expenses: List[ExpenseRow]
