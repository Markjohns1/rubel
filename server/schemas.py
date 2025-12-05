from pydantic import BaseModel
from typing import Optional
from enum import Enum
from datetime import datetime

class Category(str, Enum):
    bed = "bed"
    sofa = "sofa"
    cupboard = "cupboard"
    door = "door"
    dining = "dining"

# Product Schemas
class ProductBase(BaseModel):
    nameBn: str
    nameEn: str
    price: float
    descriptionBn: Optional[str] = None
    descriptionEn: Optional[str] = None
    category: Category

class ProductCreate(ProductBase):
    pass

class Product(ProductBase):
    id: int
    image: str

    class Config:
        from_attributes = True  # Updated from orm_mode for Pydantic v2

# User Schemas
class UserLogin(BaseModel):
    username: str
    password: str

class UserResponse(BaseModel):
    username: str
    isAdmin: bool

    class Config:
        from_attributes = True

class UserCreate(BaseModel):
    username: str
    password: str
    is_admin: bool = False

class UserUpdate(BaseModel):
    username: Optional[str] = None
    password: Optional[str] = None
    is_admin: Optional[bool] = None

class UserInDB(BaseModel):
    id: int
    username: str
    is_admin: bool

    class Config:
        from_attributes = True

# Token Schemas
class Token(BaseModel):
    access_token: str
    token_type: str
    username: str
    isAdmin: bool

class TokenData(BaseModel):
    username: Optional[str] = None
    is_admin: bool = False

# Order Schemas
class OrderCreate(BaseModel):
    customer_name: str
    customer_phone: str
    customer_address: Optional[str] = None
    total_amount: float
    items: str  # JSON string of cart items

class Order(BaseModel):
    id: int
    customer_name: str
    customer_phone: str
    customer_address: Optional[str] = None
    total_amount: float
    items: str
    status: str = "pending"  # Default status
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True