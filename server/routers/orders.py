from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
import models
import schemas
from database import get_db
from auth import get_current_admin_user, get_current_user

router = APIRouter(prefix="/api", tags=["orders"])

# Get all orders (Admin only)
@router.get("/orders", response_model=List[schemas.Order])
def get_orders(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_admin_user)
):
    """Get all orders - Admin only"""
    orders = db.query(models.Order).order_by(models.Order.created_at.desc()).all()
    return orders

# Get user's own orders (Authenticated users)
@router.get("/my-orders", response_model=List[schemas.Order])
def get_my_orders(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Get orders for the current logged-in user"""
    orders = db.query(models.Order).filter(
        models.Order.user_id == current_user.id
    ).order_by(models.Order.created_at.desc()).all()
    return orders

# Get dashboard stats (Admin only)
@router.get("/stats")
def get_stats(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_admin_user)
):
    from sqlalchemy import func

    total_orders = db.query(func.count(models.Order.id)).scalar() or 0
    total_sales = db.query(func.sum(models.Order.total_amount)).scalar() or 0
    total_products = db.query(func.count(models.Product.id)).scalar() or 0
    total_customers = db.query(func.count(func.distinct(models.Order.customer_phone))).scalar() or 0

    return {
        "total_sales": total_sales,
        "total_orders": total_orders,
        "total_customers": total_customers,
        "total_products": total_products
    }

# Create new order
@router.post("/orders")
def create_order(
    order: schemas.OrderCreate,
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(get_current_user)
):
    """Create a new order - can be guest or authenticated"""
    
    # Create order in database
    new_order = models.Order(
        user_id=current_user.id if current_user else None,
        customer_name=order.customer_name,
        customer_phone=order.customer_phone,
        customer_address=order.customer_address,
        total_amount=order.total_amount,
        items=order.items,
        status="pending"
    )
    
    db.add(new_order)
    db.commit()
    db.refresh(new_order)
    
    return {
        "message": "Order created successfully",
        "order_id": new_order.id
    }

# Update order status (Admin only)
@router.put("/orders/{order_id}", response_model=schemas.Order)
def update_order_status(
    order_id: int,
    order_update: schemas.OrderUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_admin_user)
):
    """Update order status - Admin only"""
    
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Validate status
    valid_statuses = ["pending", "processing", "completed", "cancelled"]
    if order_update.status not in valid_statuses:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}"
        )
    
    order.status = order_update.status
    db.commit()
    db.refresh(order)
    
    return order

# Delete order (Admin only)
@router.delete("/orders/{order_id}")
def delete_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_admin_user)
):
    """Delete an order - Admin only"""
    
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    db.delete(order)
    db.commit()
    
    return {"message": "Order deleted successfully"}