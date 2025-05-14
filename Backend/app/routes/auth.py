from fastapi import APIRouter, Depends, HTTPException, status, Response
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from pydantic import BaseModel
from prisma import Prisma
from ..database import get_db
from passlib.context import CryptContext
import jwt
import json
from datetime import datetime, timedelta
from typing import Optional

router = APIRouter(prefix="/auth", tags=["auth"])
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

SECRET_KEY = "your-secret-key"  # Replace with a secure key and use env vars
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 7 * 24 * 60

class UserResponse(BaseModel):
    id: int
    email: str
    role: str

class Token(BaseModel):
    token: str
    user: UserResponse

class UserCreate(BaseModel):
    email: str
    password: str
    role: str

@router.post("/register", response_model=UserResponse)
async def register_user(user: UserCreate, db: Prisma = Depends(get_db)):
    # Check if user already exists
    existing_user = await db.user.find_unique(where={"email": user.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # Hash the password
    hashed_password = pwd_context.hash(user.password)

    # Create the user
    new_user = await db.user.create({
        "email": user.email,
        "password": hashed_password,
        "role": user.role
    })

    return {
        "id": new_user.id,
        "email": new_user.email,
        "role": new_user.role
    }

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Prisma = Depends(get_db)):
    print(f"Received login request: username={form_data.username}, password={form_data.password}")
    user = await db.user.find_unique(where={"email": form_data.username})
    if not user:
        print(f"User not found for email: {form_data.username}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password. If the system data was reset, please register a new user.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    password_valid = pwd_context.verify(form_data.password, user.password)
    print(f"Password verification result: {password_valid}")
    if not password_valid:
        print(f"Password verification failed for user: {form_data.username}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    print(f"Login successful for user: {form_data.username}")
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email, "role": user.role, "user_id": user.id},
        expires_delta=access_token_expires
    )
    response = Response(
        content=json.dumps({
            "token": access_token,
            "user": {
                "id": user.id,
                "email": user.email,
                "role": user.role
            }
        }),
        media_type="application/json"
    )
    response.set_cookie(
        key="token",
        value=access_token,
        httponly=True,
        secure=False,  # Set to True in production with HTTPS
        max_age=7 * 24 * 60 * 60,  # 7 days
        samesite="lax"
    )
    return response

async def get_current_user(token: str = Depends(oauth2_scheme), db: Prisma = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except jwt.PyJWTError:
        raise credentials_exception
    user = await db.user.find_unique(where={"email": email})
    if user is None:
        raise credentials_exception
    return user

def get_current_active_user(current_user=Depends(get_current_user)):
    return current_user