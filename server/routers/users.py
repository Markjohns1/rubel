from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import models
import schemas
from database import get_db
from auth import get_current_admin_user, get_password_hash

router = APIRouter(prefix="/api/users", tags=["users"])

# Get all users (Admin only)
@router.get("/", response_model=List[schemas.UserInDB])
def get_all_users(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_admin_user)
):
    """Get list of all users - Admin only"""
    users = db.query(models.User).all()
    return users

# Get single user by ID (Admin only)
@router.get("/{user_id}", response_model=schemas.UserInDB)
def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_admin_user)
):
    """Get user by ID - Admin only"""
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

# Create new user (Admin only)
@router.post("/", response_model=schemas.UserInDB)
def create_user(
    user: schemas.UserCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_admin_user)
):
    """Create new user - Admin only"""
    
    # Check if username already exists
    existing_user = db.query(models.User).filter(
        models.User.username == user.username
    ).first()
    
    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Username already exists"
        )
    
    # Create new user
    hashed_password = get_password_hash(user.password)
    new_user = models.User(
        username=user.username,
        hashed_password=hashed_password,
        is_admin=user.is_admin
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return new_user

# Update user (Admin only)
@router.put("/{user_id}", response_model=schemas.UserInDB)
def update_user(
    user_id: int,
    user_update: schemas.UserUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_admin_user)
):
    """Update user - Admin only"""
    
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Prevent admin from removing their own admin privileges
    if user.id == current_user.id and user_update.is_admin is False:
        raise HTTPException(
            status_code=400,
            detail="Cannot remove your own admin privileges"
        )
    
    # Update username if provided
    if user_update.username:
        # Check if new username already exists
        existing = db.query(models.User).filter(
            models.User.username == user_update.username,
            models.User.id != user_id
        ).first()
        if existing:
            raise HTTPException(
                status_code=400,
                detail="Username already exists"
            )
        user.username = user_update.username
    
    # Update password if provided
    if user_update.password:
        user.hashed_password = get_password_hash(user_update.password)
    
    # Update admin status if provided
    if user_update.is_admin is not None:
        user.is_admin = user_update.is_admin
    
    db.commit()
    db.refresh(user)
    
    return user

# Delete user (Admin only)
@router.delete("/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_admin_user)
):
    """Delete user - Admin only"""
    
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Prevent admin from deleting themselves
    if user.id == current_user.id:
        raise HTTPException(
            status_code=400,
            detail="Cannot delete your own account"
        )
    
    db.delete(user)
    db.commit()
    
    return {"message": "User deleted successfully"}