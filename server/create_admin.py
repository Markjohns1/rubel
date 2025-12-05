from database import SessionLocal
import models
from auth import get_password_hash

db = SessionLocal()

# Delete existing admin if any
existing_admin = db.query(models.User).filter(models.User.username == "admin").first()
if existing_admin:
    db.delete(existing_admin)
    db.commit()

# Create fresh admin user
hashed_password = get_password_hash("admin123")
admin_user = models.User(
    username="admin",
    hashed_password=hashed_password,
    is_admin=True
)

db.add(admin_user)
db.commit()

print("✅ Admin user created successfully!")
print("Username: admin")
print("Password: admin123")

db.close()