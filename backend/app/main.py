from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends, HTTPException, status, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
import json
import logging
from typing import List, Optional
from pydantic import BaseModel
import os

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,  # Changed to DEBUG for more verbose output
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Add startup logging
logger.info("🚀 KANBAN BOARD API STARTING UP...")
logger.info("📊 Enhanced logging is ENABLED")
logger.info("🔍 Debug level logging is ACTIVE")

from . import models, database
from .database import get_db
from .models import User, Board, Column, Task, Comment
from .models import UserCreate, UserResponse, AuthResponse, BoardCreate, BoardResponse, ColumnCreate, ColumnResponse, TaskCreate, TaskResponse, CommentCreate, CommentResponse

# CORS configuration (env-driven with safe localhost defaults)
DEFAULT_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

allowed_origins_env = os.getenv("CORS_ALLOW_ORIGINS", "").strip()
ALLOWED_ORIGINS = (
    [o.strip() for o in allowed_origins_env.split(",") if o.strip()]
    if allowed_origins_env
    else DEFAULT_ALLOWED_ORIGINS
)

ALLOW_ORIGIN_REGEX = os.getenv(
    "CORS_ALLOW_ORIGIN_REGEX",
    r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$",
)

logger.info(f"🌐 CORS allow_origins: {ALLOWED_ORIGINS}")
logger.info(f"🌐 CORS allow_origin_regex: {ALLOW_ORIGIN_REGEX}")
logger.info("🌐 CORS allow_credentials: True, allow_methods: *, allow_headers: *")

# Login credentials model
class LoginCredentials(BaseModel):
    email: Optional[str] = None
    username: Optional[str] = None
    password: str

from .websocket import manager, WebSocketEvent, create_event_message, notify_task_assignment
from .auth import get_current_user, get_current_user_ws, authenticate_user, create_access_token, get_password_hash

app = FastAPI(title="Kanban Board API", version="1.0.0")

# Request logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    logger.info(f"🔵 REQUEST: {request.method} {request.url}")
    logger.info(f"📋 Headers: {dict(request.headers)}")

    if request.method == "OPTIONS":
        origin = request.headers.get("origin")
        acrm = request.headers.get("access-control-request-method")
        acrh = request.headers.get("access-control-request-headers")
        logger.info(
            f"🟠 CORS PREFLIGHT - origin={origin}, acr-method={acrm}, acr-headers={acrh}"
        )

    # Log request body for auth endpoints (after processing)
    if request.url.path in ["/auth/login", "/auth/register"]:
        logger.info(f"🔍 AUTH REQUEST DETECTED: {request.method} {request.url}")

    response = await call_next(request)
    logger.info(f"🟢 RESPONSE: {response.status_code} for {request.method} {request.url}")
    return response

# CORS middleware for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_origin_regex=ALLOW_ORIGIN_REGEX,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# OAuth2 scheme for authentication
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login", auto_error=False)


# Enhanced WebSocket endpoint for real-time updates
@app.websocket("/ws/{board_id}")
async def websocket_endpoint(websocket: WebSocket, board_id: int, current_user: User = Depends(get_current_user_ws)):
    if not current_user:
        return

    await manager.connect(websocket, board_id, current_user.id)

    try:
        # Send welcome message
        welcome_message = create_event_message(
            WebSocketEvent.USER_JOINED_BOARD,
            {
                "user_id": current_user.id,
                "username": current_user.username,
                "board_id": board_id
            },
            board_id=board_id
        )
        await manager.broadcast_to_board(welcome_message, board_id, exclude_user_id=current_user.id)

        while True:
            data = await websocket.receive_text()
            message_data = json.loads(data)

            # Handle different message types
            event_type = message_data.get("type")
            event_data = message_data.get("data", {})

            if event_type == "ping":
                # Respond to ping
                await websocket.send_text(json.dumps({"type": "pong"}))
            elif event_type == "cursor_move":
                # Broadcast cursor position to other users
                await manager.broadcast_to_board(
                    create_event_message(event_type, event_data, board_id=board_id),
                    board_id,
                    exclude_user_id=current_user.id
                )
            # Add more message handlers as needed

    except WebSocketDisconnect:
        # Notify others that user left
        leave_message = create_event_message(
            WebSocketEvent.USER_LEFT_BOARD,
            {
                "user_id": current_user.id,
                "username": current_user.username,
                "board_id": board_id
            },
            board_id=board_id
        )
        await manager.broadcast_to_board(leave_message, board_id)
        manager.disconnect(board_id, current_user.id)

# API Routes
@app.get("/users", response_model=List[UserResponse])
async def list_users(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    users = db.query(User).all()
    return [UserResponse.model_validate(u, from_attributes=True) for u in users]


@app.get("/")
async def root():
    logger.info("🌟 ROOT ENDPOINT HIT - API is running!")
    return {"message": "Kanban Board API", "version": "1.0.0", "debug": "Enhanced logging is active!"}

@app.post("/auth/register", response_model=AuthResponse)
async def register_user(user: UserCreate, db: Session = Depends(get_db)):
    import logging
    logger = logging.getLogger(__name__)

    # Enhanced logging for debugging
    logger.info(f"📝 REGISTRATION ATTEMPT: {user.username} ({user.email})")
    logger.info(f"📧 Email: {user.email}")
    logger.info(f"👤 Username: {user.username}")
    logger.info(f"👨‍💼 Full Name: {user.full_name}")
    logger.info(f"🔑 Password: {'*' * len(user.password)}")

    # Check if user already exists
    existing_email = db.query(User).filter(User.email == user.email).first()
    if existing_email:
        logger.warning(f"❌ Registration failed: Email already exists: {user.email}")
        raise HTTPException(status_code=400, detail="Email already registered")

    existing_username = db.query(User).filter(User.username == user.username).first()
    if existing_username:
        logger.warning(f"❌ Registration failed: Username already taken: {user.username}")
        raise HTTPException(status_code=400, detail="Username already taken")

    try:
        # Hash password and create user
        logger.info("🔨 Creating new user account...")
        hashed_password = get_password_hash(user.password)
        db_user = User(
            email=user.email,
            username=user.username,
            full_name=user.full_name,
            hashed_password=hashed_password
        )

        db.add(db_user)
        db.commit()
        db.refresh(db_user)

        logger.info(f"✅ User account created successfully: {db_user.username} (ID: {db_user.id})")

        # Create access token
        access_token = create_access_token(data={"sub": str(db_user.id)})

        logger.info("🎉 Registration completed successfully")
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": db_user.id,
                "email": db_user.email,
                "username": db_user.username,
                "full_name": db_user.full_name,
                "is_active": db_user.is_active,
                "created_at": db_user.created_at
            }
        }
    except Exception as e:
        logger.error(f"💥 Registration error for {user.username}: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Registration failed due to server error")

@app.post("/auth/login", response_model=AuthResponse)
async def login_user(credentials: LoginCredentials, db: Session = Depends(get_db)):
    import logging
    logger = logging.getLogger(__name__)

    # Enhanced logging for debugging
    logger.info(f"🔐 LOGIN ATTEMPT: {credentials}")
    logger.info(f"📧 Email: {credentials.email}")
    logger.info(f"👤 Username: {credentials.username}")
    logger.info(f"🔑 Password: {'*' * len(credentials.password)}")

    # Handle both email and username for login
    username_or_email = credentials.email or credentials.username
    password = credentials.password

    logger.info(f"🔍 Parsed credentials - username_or_email: {username_or_email}")

    if not username_or_email or not password:
        logger.warning("❌ Login failed: Missing username/email or password")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username/email and password are required"
        )

    logger.info(f"🔎 Authenticating user: {username_or_email}")
    user = authenticate_user(db, username_or_email, password)
    if not user:
        logger.warning(f"❌ Login failed: Invalid credentials for {username_or_email}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username/email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    logger.info(f"✅ Login successful for user: {user.username} (ID: {user.id})")
    access_token = create_access_token(data={"sub": str(user.id)})

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "username": user.username,
            "full_name": user.full_name,
            "is_active": user.is_active,
            "created_at": user.created_at
        }
    }

# Board endpoints
@app.get("/boards", response_model=List[BoardResponse])
async def get_boards(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    boards = db.query(Board).filter(Board.created_by == current_user.id).all()
    return [BoardResponse.from_orm(board) for board in boards]

@app.post("/boards", response_model=BoardResponse)
async def create_board(board: BoardCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")

    db_board = Board(name=board.name, description=board.description, created_by=current_user.id)
    db.add(db_board)
    db.commit()
    db.refresh(db_board)

    # Create default columns
    default_columns = [
        {"name": "Backlog", "position": 0},
        {"name": "To Do", "position": 1},
        {"name": "In Progress", "position": 2},
        {"name": "Done", "position": 3}
    ]

    for col_data in default_columns:
        db_column = Column(name=col_data["name"], board_id=db_board.id, position=col_data["position"])
        db.add(db_column)

    db.commit()
    db.refresh(db_board)
    return BoardResponse.from_orm(db_board)

@app.get("/boards/{board_id}", response_model=BoardResponse)
async def get_board(board_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")

    board = db.query(Board).filter(Board.id == board_id, Board.created_by == current_user.id).first()
    if not board:
        raise HTTPException(status_code=404, detail="Board not found")
    return BoardResponse.from_orm(board)

# Column endpoints
@app.post("/boards/{board_id}/columns", response_model=ColumnResponse)
async def create_column(board_id: int, column: ColumnCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")

    # Verify board ownership
    board = db.query(Board).filter(Board.id == board_id, Board.created_by == current_user.id).first()
    if not board:
        raise HTTPException(status_code=404, detail="Board not found")

    db_column = Column(name=column.name, board_id=board_id, position=column.position)
    db.add(db_column)
    db.commit()
    db.refresh(db_column)
    return db_column

@app.put("/columns/{column_id}", response_model=ColumnResponse)
async def update_column(column_id: int, column_update: ColumnCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")

    column = db.query(Column).join(Board).filter(
        Column.id == column_id,
        Board.created_by == current_user.id
    ).first()

    if not column:
        raise HTTPException(status_code=404, detail="Column not found")

    column.name = column_update.name
    column.position = column_update.position
    db.commit()
    db.refresh(column)
    return column

@app.delete("/columns/{column_id}")
async def delete_column(column_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")

    column = db.query(Column).join(Board).filter(
        Column.id == column_id,
        Board.created_by == current_user.id
    ).first()

    if not column:
        raise HTTPException(status_code=404, detail="Column not found")

    db.delete(column)
    db.commit()
    return {"message": "Column deleted successfully"}

# Task endpoints
@app.post("/boards/{board_id}/tasks", response_model=TaskResponse)
async def create_task(board_id: int, task: TaskCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")

    # Verify board ownership
    board = db.query(Board).filter(Board.id == board_id, Board.created_by == current_user.id).first()
    if not board:
        raise HTTPException(status_code=404, detail="Board not found")

    # Get the column
    column = db.query(Column).filter(Column.id == task.column_id).first()
    if not column or column.board_id != board_id:
        raise HTTPException(status_code=404, detail="Column not found")

    # Get max position for the column
    max_position = db.query(Task).filter(Task.column_id == task.column_id).count()

    # Convert tags array to JSON string for storage
    tags_json = json.dumps(task.tags) if task.tags else None
    
    db_task = Task(
        title=task.title,
        description=task.description,
        board_id=board_id,
        column_id=task.column_id,
        assignee_id=task.assignee_id,
        priority=task.priority,
        tags=tags_json,
        due_date=task.due_date,
        estimated_hours=task.estimated_hours,
        hours_used=task.hours_used,
        completed_hours=task.completed_hours,
        created_by=current_user.id,
        position=max_position
    )

    db.add(db_task)
    db.commit()
    db.refresh(db_task)

    # Broadcast task creation via WebSocket
    task_message = create_event_message(
        WebSocketEvent.TASK_CREATED,
        {
            "id": db_task.id,
            "title": db_task.title,
            "column_id": db_task.column_id,
            "position": db_task.position,
            "created_by": current_user.username
        },
        board_id=board_id
    )
    await manager.broadcast_to_board(task_message, board_id, exclude_user_id=current_user.id)

    # Notify assignee if task is assigned
    if db_task.assignee_id and db_task.assignee_id != current_user.id:
        await notify_task_assignment(db_task.id, db_task.assignee_id, current_user.id, board_id)

    return TaskResponse.from_orm(db_task)

@app.get("/tasks/{task_id}", response_model=TaskResponse)
async def get_task(task_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")

    task = db.query(Task).join(Board).filter(
        Task.id == task_id,
        Board.created_by == current_user.id
    ).first()

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return TaskResponse.from_orm(task)

@app.put("/tasks/{task_id}", response_model=TaskResponse)
async def update_task(task_id: int, task_update: TaskCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")

    task = db.query(Task).join(Board).filter(
        Task.id == task_id,
        Board.created_by == current_user.id
    ).first()

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    # Update task fields
    update_payload = task_update.dict(exclude_unset=True)
    # Convert tags list to JSON string for storage
    if "tags" in update_payload:
        try:
            update_payload["tags"] = json.dumps(update_payload["tags"]) if update_payload["tags"] is not None else None
        except Exception:
            update_payload["tags"] = None

    for field, value in update_payload.items():
        setattr(task, field, value)

    db.commit()
    db.refresh(task)
    return TaskResponse.from_orm(task)

@app.put("/tasks/{task_id}/move", response_model=TaskResponse)
async def move_task(task_id: int, move_data: dict, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")

    # Get the task
    task = db.query(Task).join(Board).filter(
        Task.id == task_id,
        Board.created_by == current_user.id
    ).first()

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Get new column and position from move_data
    new_column_id = move_data.get("column_id")
    new_position = move_data.get("position", 0)
    
    if new_column_id:
        # Verify the new column exists and belongs to the same board
        new_column = db.query(Column).filter(
            Column.id == new_column_id,
            Column.board_id == task.board_id
        ).first()
        
        if not new_column:
            raise HTTPException(status_code=404, detail="Target column not found")
        
        # Update task's column and position
        task.column_id = new_column_id
        task.position = new_position

    db.commit()
    db.refresh(task)
    return TaskResponse.from_orm(task)

@app.delete("/tasks/{task_id}")
async def delete_task(task_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")

    task = db.query(Task).join(Board).filter(
        Task.id == task_id,
        Board.created_by == current_user.id
    ).first()

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    db.delete(task)
    db.commit()

    # Broadcast task deletion via WebSocket
    delete_message = create_event_message(
        WebSocketEvent.TASK_DELETED,
        {
            "id": task_id,
            "deleted_by": current_user.username
        },
        board_id=task.board_id
    )
    await manager.broadcast_to_board(delete_message, task.board_id, exclude_user_id=current_user.id)

    return {"message": "Task deleted successfully"}

# Comment endpoints
@app.post("/tasks/{task_id}/comments", response_model=CommentResponse)
async def create_comment(task_id: int, comment: CommentCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")

    # Verify task exists and user has access
    task = db.query(Task).join(Board).filter(
        Task.id == task_id,
        Board.created_by == current_user.id
    ).first()

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    db_comment = Comment(
        content=comment.content,
        task_id=task_id,
        author_id=current_user.id
    )

    db.add(db_comment)
    db.commit()
    db.refresh(db_comment)

    # Broadcast comment creation via WebSocket
    comment_message = create_event_message(
        WebSocketEvent.COMMENT_CREATED,
        {
            "id": db_comment.id,
            "content": db_comment.content,
            "task_id": task_id,
            "author_id": current_user.id,
            "author_name": current_user.username
        },
        board_id=task.board_id
    )
    await manager.broadcast_to_board(comment_message, task.board_id, exclude_user_id=current_user.id)

    return db_comment

@app.get("/tasks/{task_id}/comments", response_model=List[CommentResponse])
async def get_task_comments(task_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")

    comments = db.query(Comment).filter(Comment.task_id == task_id).all()
    return comments

# Comment management endpoints
@app.put("/comments/{comment_id}", response_model=CommentResponse)
async def update_comment(comment_id: int, comment_update: CommentCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")

    comment = db.query(Comment).filter(Comment.id == comment_id).first()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")

    # Only the author can edit their comment
    if comment.author_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not allowed to edit this comment")

    comment.content = comment_update.content
    db.commit()
    db.refresh(comment)
    return comment

@app.delete("/comments/{comment_id}")
async def delete_comment(comment_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")

    comment = db.query(Comment).filter(Comment.id == comment_id).first()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")

    # Only the author can delete their comment
    if comment.author_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not allowed to delete this comment")

    db.delete(comment)
    db.commit()
    return {"message": "Comment deleted"}

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy"}
