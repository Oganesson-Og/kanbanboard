#!/usr/bin/env python3

from sqlalchemy import create_engine
from app.database import Base
from app.models import User, Board, Column, Task, Comment  # Import models to ensure they're registered
import os

def create_database():
    # Create SQLite database
    database_url = "sqlite:///./kanban.db"
    engine = create_engine(database_url, connect_args={"check_same_thread": False})

    # Create all tables
    Base.metadata.create_all(bind=engine)
    print("Database created successfully!")

if __name__ == "__main__":
    create_database()
