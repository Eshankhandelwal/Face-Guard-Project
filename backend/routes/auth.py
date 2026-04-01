from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from database import get_db
from models import User
from schemas import UserCreate, UserLogin, Token
import hashlib, secrets
from jose import jwt
from datetime import datetime, timedelta
from typing import Optional

router = APIRouter()

SECRET_KEY = "faceguard-secret-key-2025"
ALGORITHM = "HS256"

def hash_password(password: str) -> str:
    salt = secrets.token_hex(16)
    hashed = hashlib.sha256((password + salt).encode()).hexdigest()
    return f"{salt}:{hashed}"

def verify_password(plain: str, stored: str) -> bool:
    try:
        salt, hashed = stored.split(":")
        return hashlib.sha256((plain + salt).encode()).hexdigest() == hashed
    except:
        return False

def create_access_token(data: dict) -> str:
    payload = data.copy()
    payload["exp"] = datetime.utcnow() + timedelta(hours=24)
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
) -> User:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    token = authorization.split(" ")[1]
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("user_id")
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")

def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user

def require_officer(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role not in ["admin", "officer"]:
        raise HTTPException(status_code=403, detail="Officer access required")
    return current_user

def require_any(current_user: User = Depends(get_current_user)) -> User:
    return current_user


# ── Public register ──────────────────────────────────────────
@router.post("/register")
def register(body: UserCreate, db: Session = Depends(get_db)):
    # Block multiple admins
    if body.role == "admin":
        existing = db.query(User).filter(User.role == "admin").first()
        if existing:
            raise HTTPException(
                status_code=400,
                detail="An admin already exists. Only one admin is allowed. Please register as officer or citizen."
            )

    if db.query(User).filter(User.email == body.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        name=body.name,
        email=body.email,
        hashed_password=hash_password(body.password),
        role=body.role
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Return success message only — frontend will redirect to login
    return {
        "message": "Account created successfully. Please login.",
        "role": user.role,
        "name": user.name
    }


# ── Login ────────────────────────────────────────────────────
@router.post("/login", response_model=Token)
def login(body: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == body.email).first()
    if not user or not verify_password(body.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_access_token({"user_id": user.id, "role": user.role})
    return {
        "access_token": token,
        "token_type": "bearer",
        "role": user.role,
        "name": user.name
    }


# ── Get current user ─────────────────────────────────────────
@router.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "role": current_user.role
    }


# ── Admin: get all users ─────────────────────────────────────
@router.get("/users")
def get_all_users(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    users = db.query(User).order_by(User.created_at.desc()).all()
    return [
        {
            "id": u.id,
            "name": u.name,
            "email": u.email,
            "role": u.role,
            "created_at": u.created_at
        }
        for u in users
    ]


# ── Admin: create officer or citizen ─────────────────────────
@router.post("/users/create")
def admin_create_user(
    body: UserCreate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    if body.role == "admin":
        raise HTTPException(
            status_code=400,
            detail="Cannot create another admin. Only one admin is allowed."
        )

    if db.query(User).filter(User.email == body.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        name=body.name,
        email=body.email,
        hashed_password=hash_password(body.password),
        role=body.role
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    return {
        "message": f"{body.role.capitalize()} created successfully",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "created_at": user.created_at
        }
    }


# ── Admin: delete officer or citizen ─────────────────────────
@router.delete("/users/{user_id}")
def delete_user(
    user_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.role == "admin":
        raise HTTPException(status_code=403, detail="Admin account cannot be deleted")

    if user.id == current_user.id:
        raise HTTPException(status_code=403, detail="You cannot delete your own account")

    name = user.name
    db.delete(user)
    db.commit()
    return {"message": f"User '{name}' deleted successfully"}

# ── Update own profile ────────────────────────────────────────
@router.put("/profile")
def update_profile(
    name: Optional[str] = None,
    email: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if email and email != current_user.email:
        existing = db.query(User).filter(User.email == email).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email already in use")
        current_user.email = email

    if name:
        current_user.name = name

    db.commit()
    db.refresh(current_user)
    return {
        "message": "Profile updated successfully",
        "name": current_user.name,
        "email": current_user.email
    }


# ── Change own password ───────────────────────────────────────
@router.put("/change-password")
def change_password(
    current_password: str,
    new_password: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not verify_password(current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Current password is incorrect")

    if len(new_password) < 6:
        raise HTTPException(status_code=400, detail="New password must be at least 6 characters")

    current_user.hashed_password = hash_password(new_password)
    db.commit()
    return {"message": "Password changed successfully"}