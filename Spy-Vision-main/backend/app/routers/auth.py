from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.schemas.user import AuthResponse, UserLogin, UserRegister, UserResponse
from app.utils.auth import (
    generate_session_token,
    get_current_user,
    hash_password,
    verify_password,
)

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def register(payload: UserRegister, db: Session = Depends(get_db)):
    clean_username = payload.username.strip().lower()
    clean_fullname = payload.full_name.strip()
    clean_badge = payload.badge_number.strip() if payload.badge_number else f"OP-{clean_username.upper()}"

    # Check for existing user
    stmt = select(User).where(User.username == clean_username)
    existing = db.scalars(stmt).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An operator account with this username already exists.",
        )

    token = generate_session_token()
    user = User(
        username=clean_username,
        password_hash=hash_password(payload.password),
        full_name=clean_fullname,
        badge_number=clean_badge,
        role=payload.role.strip().upper() if payload.role else "OPERATOR",
        is_verified=True,
        session_token=token,
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return AuthResponse(
        token=token,
        user=UserResponse.model_validate(user),
        message="Operator account created and verified successfully.",
    )


@router.post("/login", response_model=AuthResponse)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    clean_username = payload.username.strip().lower()
    stmt = select(User).where(User.username == clean_username)
    user = db.scalars(stmt).first()

    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid operator credentials. Access denied.",
        )

    if not user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Operator ID has not been verified by Central Command.",
        )

    # Issue a new session token
    token = generate_session_token()
    user.session_token = token
    db.commit()
    db.refresh(user)

    return AuthResponse(
        token=token,
        user=UserResponse.model_validate(user),
        message="Operator authenticated and verified successfully.",
    )


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return UserResponse.model_validate(current_user)


@router.post("/logout")
def logout(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    current_user.session_token = None
    db.commit()
    return {"message": "Operator signed out successfully."}

