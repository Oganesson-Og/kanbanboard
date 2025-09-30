#!/usr/bin/env python3

from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean, create_engine
from sqlalchemy.orm import declarative_base, relationship
from sqlalchemy.sql import func

Base = declarative_base()

class TestTask(Base):
    __tablename__ = "test_tasks"

    id = Column(Integer, primary_key=True)
    title = Column(String, nullable=False)

if __name__ == "__main__":
    print("Test model created successfully")

