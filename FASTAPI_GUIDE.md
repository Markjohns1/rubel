# FastAPI Backend Implementation Guide

You requested to build the backend yourself. This frontend is now configured to talk to a standard REST API.

## 1. API Structure
The frontend expects a FastAPI server running at `/api`.

### Data Models (Pydantic)

```python
from pydantic import BaseModel
from typing import Optional, List
from enum import Enum

class Category(str, Enum):
    bed = "bed"
    sofa = "sofa"
    cupboard = "cupboard"
    door = "door"
    dining = "dining"

class ProductBase(BaseModel):
    nameBn: str
    nameEn: str
    price: float
    descriptionBn: Optional[str] = None
    descriptionEn: Optional[str] = None
    image: str
    category: Category

class ProductCreate(ProductBase):
    pass

class Product(ProductBase):
    id: int
    
    class Config:
        orm_mode = True

class UserLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    username: str
    isAdmin: bool
```

## 2. Required Endpoints

Your FastAPI app needs to implement these routes:

### Products
- `GET /api/products` - Returns list of products
- `GET /api/products/{id}` - Returns single product
- `POST /api/products` - Create new product (Admin only)
- `DELETE /api/products/{id}` - Delete product (Admin only)

### Authentication
- `POST /api/auth/login` - Returns `Token` object
- `GET /api/auth/me` - Returns current user info

### Orders
- `POST /api/orders` - Receive order JSON

## 3. File Structure Recommendation

Since I cannot create backend files, please create this structure yourself:

```
server/
├── main.py          # FastAPI app entry point
├── models.py        # SQLAlchemy models
├── schemas.py       # Pydantic models (copy from above)
├── database.py      # DB connection
└── routers/
    ├── products.py
    ├── auth.py
    └── orders.py
```

## 4. Running the Backend

1. Install dependencies: `pip install fastapi uvicorn sqlalchemy`
2. Run server: `uvicorn server.main:app --reload --port 8000`
3. Configure Vite proxy in `vite.config.ts` if needed (currently set to expect relative paths).
