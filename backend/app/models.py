from sqlalchemy import Integer, String, Text, DateTime, Float, ForeignKey, Boolean, func
from sqlalchemy.orm import relationship, Mapped, mapped_column
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from .database import Base

# Database Models
class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    email: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    username: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    full_name: Mapped[str] = mapped_column(String)
    hashed_password: Mapped[str] = mapped_column(String, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_admin: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    created_tasks = relationship("Task", back_populates="creator", foreign_keys="Task.created_by")
    assigned_tasks = relationship("Task", back_populates="assignee", foreign_keys="Task.assignee_id")
    owned_boards = relationship("Board", back_populates="creator")
    comments = relationship("Comment", back_populates="author")

class Board(Base):
    __tablename__ = "boards"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[str] = mapped_column(Text)
    created_by: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    creator = relationship("User", back_populates="owned_boards")
    columns = relationship("Column", back_populates="board", cascade="all, delete-orphan")
    tasks = relationship("Task", back_populates="board", cascade="all, delete-orphan")

class Column(Base):
    __tablename__ = "columns"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String, nullable=False)
    board_id: Mapped[int] = mapped_column(Integer, ForeignKey("boards.id"), nullable=False)
    position: Mapped[int] = mapped_column(Integer, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    board = relationship("Board", back_populates="columns")
    tasks = relationship("Task", back_populates="column", cascade="all, delete-orphan")

class Task(Base):
    __tablename__ = "tasks"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    board_id: Mapped[int] = mapped_column(Integer, ForeignKey("boards.id"), nullable=False)
    column_id: Mapped[int] = mapped_column(Integer, ForeignKey("columns.id"), nullable=False)
    assignee_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("users.id"), nullable=True)
    priority: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    tags: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    due_date: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    estimated_hours: Mapped[Optional[float]] = mapped_column(Float, nullable=True, default=0.0)
    hours_used: Mapped[Optional[float]] = mapped_column(Float, nullable=True, default=0.0)
    completed_hours: Mapped[Optional[float]] = mapped_column(Float, nullable=True, default=0.0)
    created_by: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)
    position: Mapped[int] = mapped_column(Integer, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    board = relationship("Board", back_populates="tasks")
    column = relationship("Column", back_populates="tasks")
    assignee = relationship("User", back_populates="assigned_tasks", foreign_keys=[assignee_id])
    creator = relationship("User", back_populates="created_tasks", foreign_keys=[created_by])
    comments = relationship("Comment", back_populates="task", cascade="all, delete-orphan")

class Comment(Base):
    __tablename__ = "comments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    task_id: Mapped[int] = mapped_column(Integer, ForeignKey("tasks.id"), nullable=False)
    author_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    task = relationship("Task", back_populates="comments")
    author = relationship("User", back_populates="comments")

# Pydantic Models for API
class UserCreate(BaseModel):
    email: str
    username: str
    full_name: str
    password: str

class UserResponse(BaseModel):
    id: int
    email: str
    username: str
    full_name: str
    is_active: bool
    is_admin: bool
    created_at: datetime

    class Config:
        from_attributes = True

class AuthResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class BoardCreate(BaseModel):
    name: str
    description: Optional[str] = None

class BoardResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    created_by: int
    is_active: bool
    created_at: datetime
    columns: List['ColumnResponse'] = []

    class Config:
        from_attributes = True
    
    @classmethod
    def from_orm(cls, obj):
        # Convert columns using ColumnResponse.from_orm
        columns = [ColumnResponse.from_orm(column) for column in obj.columns] if obj.columns else []
        
        return cls(
            id=obj.id,
            name=obj.name,
            description=obj.description,
            created_by=obj.created_by,
            is_active=obj.is_active,
            created_at=obj.created_at,
            columns=columns
        )

class ColumnCreate(BaseModel):
    name: str
    position: int

class ColumnResponse(BaseModel):
    id: int
    name: str
    board_id: int
    position: int
    tasks: List['TaskResponse'] = []

    class Config:
        from_attributes = True
    
    @classmethod
    def from_orm(cls, obj):
        # Convert tasks using TaskResponse.from_orm
        tasks = [TaskResponse.from_orm(task) for task in obj.tasks] if obj.tasks else []
        
        return cls(
            id=obj.id,
            name=obj.name,
            board_id=obj.board_id,
            position=obj.position,
            tasks=tasks
        )

class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    column_id: int
    assignee_id: Optional[int] = None
    priority: Optional[str] = "medium"
    tags: Optional[List[str]] = []
    due_date: Optional[datetime] = None
    estimated_hours: Optional[float] = 0.0
    hours_used: Optional[float] = 0.0
    completed_hours: Optional[float] = 0.0

class TaskResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    board_id: int
    column_id: int
    assignee_id: Optional[int]
    priority: str
    tags: List[str]
    due_date: Optional[datetime]
    estimated_hours: Optional[float] = 0.0
    hours_used: Optional[float] = 0.0
    completed_hours: Optional[float] = 0.0
    created_by: int
    position: int
    is_active: bool
    created_at: datetime
    assignee: Optional[UserResponse] = None
    comments: List['CommentResponse'] = []

    class Config:
        from_attributes = True
    
    @classmethod
    def from_orm(cls, obj):
        # Convert JSON string tags back to list
        tags = []
        if obj.tags:
            try:
                import json
                tags = json.loads(obj.tags) if isinstance(obj.tags, str) else obj.tags
            except (json.JSONDecodeError, TypeError):
                tags = []
        
        return cls(
            id=obj.id,
            title=obj.title,
            description=obj.description,
            board_id=obj.board_id,
            column_id=obj.column_id,
            assignee_id=obj.assignee_id,
            priority=obj.priority,
            tags=tags,
            due_date=obj.due_date,
            estimated_hours=obj.estimated_hours,
            hours_used=obj.hours_used,
            completed_hours=obj.completed_hours,
            created_by=obj.created_by,
            position=obj.position,
            is_active=obj.is_active,
            created_at=obj.created_at,
            assignee=obj.assignee,
            comments=obj.comments
        )

class CommentCreate(BaseModel):
    content: str

class CommentResponse(BaseModel):
    id: int
    content: str
    task_id: int
    author_id: int
    created_at: datetime
    author: UserResponse

    class Config:
        from_attributes = True

# Update forward references
BoardResponse.model_rebuild()
ColumnResponse.model_rebuild()
TaskResponse.model_rebuild()
CommentResponse.model_rebuild()
