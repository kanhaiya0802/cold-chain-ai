from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
import jwt
import os

from schemas import schemas
from services import crud
from core.database import get_db
from core import auth

router = APIRouter(prefix="/auth", tags=["auth"])

from core.auth import SECRET_KEY, ALGORITHM, verify_password

@router.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    print(f"Login attempt: username={form_data.username}, password={form_data.password}")
    user = crud.get_user_by_username(db, username=form_data.username)
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
        )
    
    # Create JWT
    token_data = {
        "sub": str(user.user_id),
        "username": form_data.username,
        "role": user.role.value,
        "org": user.organization_name
    }
    access_token = jwt.encode(token_data, SECRET_KEY, algorithm=ALGORITHM)
    
    return {"access_token": access_token, "token_type": "bearer", "role": user.role.value}
