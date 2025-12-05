from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import models
import schemas
from database import get_db
from auth import get_current_admin_user

router = APIRouter(prefix="/api", tags=["orders"])

# Get all orders (Admin only)
@router.get("/orders", response_model=List[schemas.Order])
def get_orders(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_admin_user)
):
    orders = db.query(models.Order).all()
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
    db: Session = Depends(get_db)
):
    # Create order in database
    new_order = models.Order(
        customer_name=order.customer_name,
        customer_phone=order.customer_phone,
        customer_address=order.customer_address,
        total_amount=order.total_amount,
        items=order.items  # Store as JSON string
    )
    db.add(new_order)
    db.commit()
    db.refresh(new_order)
    return {
        "message": "Order created successfully",
        "order_id": new_order.id
    }
