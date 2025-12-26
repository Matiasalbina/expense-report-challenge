from fastapi import APIRouter

from app.api.auth import router as auth_router
from app.api.expenses import router as expenses_router
from app.api.meta import router as meta_router
from app.api.reports import router as reports_router

api_router = APIRouter()

api_router.include_router(auth_router, prefix="/auth", tags=["auth"])
api_router.include_router(expenses_router, prefix="/expenses", tags=["expenses"])
api_router.include_router(meta_router, prefix="/meta", tags=["meta"])
api_router.include_router(reports_router, prefix="/reports", tags=["reports"])
