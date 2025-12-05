from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path
import models
from database import engine, SessionLocal
from auth import get_password_hash
from routers import products, auth, orders, users

# Initialize FastAPI app FIRST
app = FastAPI(title="Rubel Woodworks API")

# CORS Configuration - MUST BE RIGHT AFTER APP INIT
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Temporarily allow all for testing
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Now create database tables
models.Base.metadata.create_all(bind=engine)

# Mount static files for uploads
Path("static/uploads").mkdir(parents=True, exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")

# Include routers FIRST (before frontend mount)
app.include_router(products.router)
app.include_router(auth.router)
app.include_router(orders.router)
app.include_router(users.router)

# Mount frontend static files in production AFTER API routers
import os
if os.getenv("NODE_ENV") == "production":
    frontend_dist = Path("../dist/public")
    if frontend_dist.exists():
        app.mount("/", StaticFiles(directory=str(frontend_dist), html=True), name="frontend")

# Root endpoint
@app.get("/")
def root():
    return {"message": "Welcome to Rubel Woodworks API"}

# Create default admin user on startup
@app.on_event("startup")
def create_default_admin():
    db = SessionLocal()
    try:
        admin = db.query(models.User).filter(models.User.username == "admin").first()
        if not admin:
            hashed_password = get_password_hash("admin123")
            admin_user = models.User(
                username="admin",
                hashed_password=hashed_password,
                is_admin=True
            )
            db.add(admin_user)
            db.commit()
            print("✅ Default admin user created (username: admin, password: admin123)")
        else:
            # Update admin password to ensure compatibility with new bcrypt format
            admin.hashed_password = get_password_hash("admin123")
            db.commit()
            print("✅ Admin user password updated (username: admin, password: admin123)")
    finally:
        db.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)