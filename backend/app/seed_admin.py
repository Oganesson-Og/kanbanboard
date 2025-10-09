from sqlalchemy.orm import Session
from .database import SessionLocal
from .models import User
from .auth import get_password_hash


def ensure_admin_user(email: str, username: str, password: str) -> None:
    db: Session = SessionLocal()
    try:
        user = db.query(User).filter((User.email == email) | (User.username == username)).first()
        if user:
            # Ensure existing user is both admin and active
            if not user.is_admin or not user.is_active:
                user.is_admin = True
                user.is_active = True
                db.commit()
            return

        hashed = get_password_hash(password)
        admin = User(
            email=email,
            username=username,
            full_name="Administrator",
            hashed_password=hashed,
            is_admin=True,
            is_active=True,
        )
        db.add(admin)
        db.commit()
    finally:
        db.close()


if __name__ == "__main__":
    import os
    email = os.getenv("ADMIN_EMAIL", "admin@example.com")
    username = os.getenv("ADMIN_USERNAME", "admin")
    password = os.getenv("ADMIN_PASSWORD", "ChangeMe123!")
    ensure_admin_user(email, username, password)


