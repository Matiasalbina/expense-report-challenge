from fastapi import APIRouter, HTTPException
from app.models.schemas import LoginRequest, LoginResponse

router = APIRouter()


@router.post("/login", response_model=LoginResponse)
def login(payload: LoginRequest):
    if "@" not in payload.email:
        raise HTTPException(status_code=400, detail="Invalid email format")
    if not payload.password.strip():
        raise HTTPException(status_code=400, detail="Password cannot be empty")

    return LoginResponse(token="mock-token")
