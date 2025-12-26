from fastapi import APIRouter
from typing import List

from app.models.schemas import OptionItem
from app.services.meta_service import get_categories, get_departments

router = APIRouter()


@router.get("/categories", response_model=List[OptionItem])
def categories():
    return get_categories()


@router.get("/departments", response_model=List[OptionItem])
def departments():
    return get_departments()
