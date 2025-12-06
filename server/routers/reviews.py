from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
import models
import schemas
from database import get_db
from auth import get_current_user, get_current_admin_user

router = APIRouter(prefix="/api", tags=["reviews"])

# Get all approved reviews for a product
@router.get("/products/{product_id}/reviews", response_model=List[schemas.ReviewResponse])
def get_product_reviews(
    product_id: int,
    db: Session = Depends(get_db)
):
    """Get all approved reviews for a specific product"""
    reviews = db.query(models.Review).filter(
        models.Review.product_id == product_id,
        models.Review.is_approved == True
    ).order_by(models.Review.created_at.desc()).all()
    
    # Add username to each review
    review_responses = []
    for review in reviews:
        user = db.query(models.User).filter(models.User.id == review.user_id).first()
        review_dict = {
            "id": review.id,
            "product_id": review.product_id,
            "user_id": review.user_id,
            "username": user.username if user else "Anonymous",
            "rating": review.rating,
            "comment": review.comment,
            "is_approved": review.is_approved,
            "created_at": review.created_at
        }
        review_responses.append(review_dict)
    
    return review_responses

# Get product rating statistics
@router.get("/products/{product_id}/rating")
def get_product_rating(
    product_id: int,
    db: Session = Depends(get_db)
):
    """Get average rating and review count for a product"""
    stats = db.query(
        func.avg(models.Review.rating).label('average_rating'),
        func.count(models.Review.id).label('review_count')
    ).filter(
        models.Review.product_id == product_id,
        models.Review.is_approved == True
    ).first()
    
    return {
        "average_rating": round(float(stats.average_rating), 1) if stats.average_rating else 0.0,
        "review_count": stats.review_count or 0
    }

# Create a new review (Authenticated users only)
@router.post("/reviews", response_model=schemas.ReviewResponse)
def create_review(
    review: schemas.ReviewCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Create a new product review"""
    
    # Check if product exists
    product = db.query(models.Product).filter(models.Product.id == review.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Check if user already reviewed this product
    existing_review = db.query(models.Review).filter(
        models.Review.product_id == review.product_id,
        models.Review.user_id == current_user.id
    ).first()
    
    if existing_review:
        raise HTTPException(
            status_code=400,
            detail="You have already reviewed this product"
        )
    
    # Create new review
    new_review = models.Review(
        product_id=review.product_id,
        user_id=current_user.id,
        rating=review.rating,
        comment=review.comment,
        is_approved=True  # Auto-approve for now
    )
    
    db.add(new_review)
    db.commit()
    db.refresh(new_review)
    
    return {
        "id": new_review.id,
        "product_id": new_review.product_id,
        "user_id": new_review.user_id,
        "username": current_user.username,
        "rating": new_review.rating,
        "comment": new_review.comment,
        "is_approved": new_review.is_approved,
        "created_at": new_review.created_at
    }

# Get all reviews (Admin only - for moderation)
@router.get("/admin/reviews", response_model=List[schemas.ReviewResponse])
def get_all_reviews(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_admin_user)
):
    """Get all reviews for admin moderation"""
    reviews = db.query(models.Review).order_by(models.Review.created_at.desc()).all()
    
    review_responses = []
    for review in reviews:
        user = db.query(models.User).filter(models.User.id == review.user_id).first()
        product = db.query(models.Product).filter(models.Product.id == review.product_id).first()
        review_dict = {
            "id": review.id,
            "product_id": review.product_id,
            "user_id": review.user_id,
            "username": user.username if user else "Anonymous",
            "rating": review.rating,
            "comment": review.comment,
            "is_approved": review.is_approved,
            "created_at": review.created_at
        }
        review_responses.append(review_dict)
    
    return review_responses

# Update review approval status (Admin only)
@router.put("/admin/reviews/{review_id}", response_model=schemas.ReviewResponse)
def update_review(
    review_id: int,
    review_update: schemas.ReviewUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_admin_user)
):
    """Approve or reject a review"""
    review = db.query(models.Review).filter(models.Review.id == review_id).first()
    
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    
    review.is_approved = review_update.is_approved
    db.commit()
    db.refresh(review)
    
    user = db.query(models.User).filter(models.User.id == review.user_id).first()
    
    return {
        "id": review.id,
        "product_id": review.product_id,
        "user_id": review.user_id,
        "username": user.username if user else "Anonymous",
        "rating": review.rating,
        "comment": review.comment,
        "is_approved": review.is_approved,
        "created_at": review.created_at
    }

# Delete review (Admin only)
@router.delete("/admin/reviews/{review_id}")
def delete_review(
    review_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_admin_user)
):
    """Delete a review"""
    review = db.query(models.Review).filter(models.Review.id == review_id).first()
    
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    
    db.delete(review)
    db.commit()
    
    return {"message": "Review deleted successfully"}