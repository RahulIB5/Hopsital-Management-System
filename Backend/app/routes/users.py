from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from prisma import Prisma
from pydantic import BaseModel, EmailStr
from ..database import get_db
from passlib.context import CryptContext
from .auth import get_current_active_user

router = APIRouter(prefix="/users", tags=["users"])
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    role: str = "user"  # Default role is user

class UserResponse(BaseModel):
    id: int
    email: str
    role: str
    createdAt: datetime

@router.post("/", status_code=status.HTTP_201_CREATED, response_model=UserResponse)
async def create_user(user_data: UserCreate, db: Prisma = Depends(get_db)):
    """Create a new user account."""
    # Check if user already exists
    existing_user = await db.user.find_unique(
        where={"email": user_data.email}
    )
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Hash the password
    hashed_password = pwd_context.hash(user_data.password)
    
    # Create the user
    new_user = await db.user.create(
        data={
            "email": user_data.email,
            "password": hashed_password,
            "role": user_data.role
        }
    )
    
    # Return user without password
    return new_user

@router.get("/me", response_model=UserResponse)
async def read_users_me(current_user = Depends(get_current_active_user)):
    """Get current authenticated user's information."""
    return current_user

@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: int, 
    db: Prisma = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    """Get a specific user by ID (admin only)."""
    # Check if current user is admin
    if current_user.role != "admin" and current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this resource"
        )
        
    user = await db.user.find_unique(where={"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.get("/", response_model=list[UserResponse])
async def list_users(
    skip: int = 0, 
    limit: int = 10, 
    db: Prisma = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    """List all users (admin only)."""
    # Check if current user is admin
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this resource"
        )
        
    users = await db.user.find_many(
        skip=skip,
        take=limit,
        order={"id": "asc"}
    )
    return users