from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
import models
import schemas
from database import get_db
from auth import get_current_admin_user
import shutil
import os
from pathlib import Path
import uuid

router = APIRouter(prefix="/api", tags=["products"])

# Upload directory - FIXED PATH
UPLOAD_DIR = "static/uploads"
Path(UPLOAD_DIR).mkdir(parents=True, exist_ok=True)

# Get all products
@router.get("/products", response_model=List[schemas.Product])
def get_products(db: Session = Depends(get_db)):
    products = db.query(models.Product).all()
    return products

# Get single product by ID
@router.get("/products/{product_id}", response_model=schemas.Product)
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

# Create new product (Admin only)
@router.post("/products", response_model=schemas.Product)
async def create_product(
    nameEn: str = Form(...),
    nameBn: str = Form(...),
    price: float = Form(...),
    category: str = Form(...),
    descriptionEn: str = Form(""),
    descriptionBn: str = Form(""),
    image: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_admin_user)
):
    # Generate unique filename to prevent overwrites
    file_ext = os.path.splitext(image.filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_ext}"
    file_location = f"{UPLOAD_DIR}/{unique_filename}"

    # Save the uploaded image
    with open(file_location, "wb+") as buffer:
        shutil.copyfileobj(image.file, buffer)

    # Create image URL (accessible from frontend)
    image_url = f"/static/uploads/{unique_filename}"

    # Create product in database
    new_product = models.Product(
        nameEn=nameEn,
        nameBn=nameBn,
        price=price,
        category=category,
        descriptionEn=descriptionEn,
        descriptionBn=descriptionBn,
        image=image_url
    )

    db.add(new_product)
    db.commit()
    db.refresh(new_product)

    return new_product

# Update product (Admin only)
@router.put("/products/{product_id}", response_model=schemas.Product)
async def update_product(
    product_id: int,
    nameEn: Optional[str] = Form(None),
    nameBn: Optional[str] = Form(None),
    price: Optional[float] = Form(None),
    category: Optional[str] = Form(None),
    descriptionEn: Optional[str] = Form(None),
    descriptionBn: Optional[str] = Form(None),
    image: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_admin_user)
):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # Update text fields if provided
    if nameEn is not None:
        product.nameEn = nameEn
    if nameBn is not None:
        product.nameBn = nameBn
    if price is not None:
        product.price = price
    if category is not None:
        product.category = category
    if descriptionEn is not None:
        product.descriptionEn = descriptionEn
    if descriptionBn is not None:
        product.descriptionBn = descriptionBn

    # Update image if new one is provided
    if image:
        # Delete old image file
        if product.image:
            old_image_path = product.image.replace("/static/", "static/")
            if os.path.exists(old_image_path):
                try:
                    os.remove(old_image_path)
                except Exception as e:
                    print(f"Could not delete old image: {e}")

        # Save new image with unique filename
        file_ext = os.path.splitext(image.filename)[1]
        unique_filename = f"{uuid.uuid4()}{file_ext}"
        file_location = f"{UPLOAD_DIR}/{unique_filename}"
        
        with open(file_location, "wb+") as buffer:
            shutil.copyfileobj(image.file, buffer)
        
        product.image = f"/static/uploads/{unique_filename}"

    db.commit()
    db.refresh(product)

    return product

# Delete product (Admin only)
@router.delete("/products/{product_id}")
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_admin_user)
):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # Delete the image file if it exists
    if product.image:
        image_path = product.image.replace("/static/", "static/")
        if os.path.exists(image_path):
            try:
                os.remove(image_path)
            except Exception as e:
                print(f"Could not delete image: {e}")

    db.delete(product)
    db.commit()

    return {"message": "Product deleted successfully"}