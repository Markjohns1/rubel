from sqlalchemy import Boolean, Column, Integer, String, Float, DateTime
from database import Base
from datetime import datetime
import enum

class Category(str, enum.Enum):
    bed = "bed"
    sofa = "sofa"
    cupboard = "cupboard"
    door = "door"
    dining = "dining"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_admin = Column(Boolean, default=False)

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    nameBn = Column(String, nullable=False)
    nameEn = Column(String, nullable=False)
    price = Column(Float, nullable=False)
    descriptionBn = Column(String, nullable=True)
    descriptionEn = Column(String, nullable=True)
    image = Column(String, nullable=False)  # Stores the file path
    category = Column(String, nullable=False)

class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    customer_name = Column(String, nullable=False)
    customer_phone = Column(String, nullable=False)
    customer_address = Column(String, nullable=True)
    total_amount = Column(Float, nullable=False)
    items = Column(String, nullable=True)  # Store as JSON string
    status = Column(String, default="pending")  # pending, processing, completed, cancelled
    created_at = Column(DateTime, default=datetime.utcnow)
