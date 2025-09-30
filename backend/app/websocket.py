from fastapi import WebSocket, WebSocketDisconnect, Depends
from sqlalchemy.orm import Session
from typing import Dict, List, Set
import json
import asyncio
from .database import get_db
from .models import User
from .auth import get_current_user_ws

class ConnectionManager:
    def __init__(self):
        # Store active connections: {board_id: {user_id: WebSocket}}
        self.active_connections: Dict[int, Dict[int, WebSocket]] = {}
        # Store user-board subscriptions: {user_id: Set[board_id]}
        self.user_boards: Dict[int, Set[int]] = {}

    async def connect(self, websocket: WebSocket, board_id: int, user_id: int):
        await websocket.accept()

        # Initialize board connections if not exists
        if board_id not in self.active_connections:
            self.active_connections[board_id] = {}
        if user_id not in self.user_boards:
            self.user_boards[user_id] = set()

        # Add connection and subscription
        self.active_connections[board_id][user_id] = websocket
        self.user_boards[user_id].add(board_id)

    def disconnect(self, board_id: int, user_id: int):
        # Remove from board connections
        if board_id in self.active_connections and user_id in self.active_connections[board_id]:
            del self.active_connections[board_id][user_id]

        # Clean up empty board connections
        if board_id in self.active_connections and not self.active_connections[board_id]:
            del self.active_connections[board_id]

        # Remove from user subscriptions
        if user_id in self.user_boards and board_id in self.user_boards[user_id]:
            self.user_boards[user_id].remove(board_id)

        # Clean up user if no subscriptions
        if user_id in self.user_boards and not self.user_boards[user_id]:
            del self.user_boards[user_id]

    async def send_personal_message(self, message: dict, user_id: int):
        """Send message to specific user across all their boards"""
        if user_id in self.user_boards:
            for board_id in self.user_boards[user_id]:
                if board_id in self.active_connections and user_id in self.active_connections[board_id]:
                    websocket = self.active_connections[board_id][user_id]
                    try:
                        await websocket.send_text(json.dumps(message))
                    except:
                        # Remove broken connection
                        self.disconnect(board_id, user_id)

    async def broadcast_to_board(self, message: dict, board_id: int, exclude_user_id: int = None):
        """Broadcast message to all users in a specific board"""
        if board_id not in self.active_connections:
            return

        disconnected_users = []
        for user_id, websocket in self.active_connections[board_id].items():
            if user_id == exclude_user_id:
                continue

            try:
                await websocket.send_text(json.dumps(message))
            except:
                disconnected_users.append(user_id)

        # Clean up disconnected users
        for user_id in disconnected_users:
            self.disconnect(board_id, user_id)

    async def broadcast_to_users(self, message: dict, user_ids: List[int]):
        """Broadcast message to specific users"""
        for user_id in user_ids:
            await self.send_personal_message(message, user_id)

    def get_board_users(self, board_id: int) -> List[int]:
        """Get all user IDs connected to a specific board"""
        if board_id not in self.active_connections:
            return []
        return list(self.active_connections[board_id].keys())

    def get_user_boards(self, user_id: int) -> List[int]:
        """Get all board IDs a user is subscribed to"""
        if user_id not in self.user_boards:
            return []
        return list(self.user_boards[user_id])

manager = ConnectionManager()

# WebSocket event types
class WebSocketEvent:
    # Board events
    BOARD_UPDATED = "board_updated"
    BOARD_DELETED = "board_deleted"

    # Column events
    COLUMN_CREATED = "column_created"
    COLUMN_UPDATED = "column_updated"
    COLUMN_DELETED = "column_deleted"

    # Task events
    TASK_CREATED = "task_created"
    TASK_UPDATED = "task_updated"
    TASK_DELETED = "task_deleted"
    TASK_MOVED = "task_moved"

    # Comment events
    COMMENT_CREATED = "comment_created"
    COMMENT_UPDATED = "comment_updated"
    COMMENT_DELETED = "comment_deleted"

    # User events
    USER_JOINED_BOARD = "user_joined_board"
    USER_LEFT_BOARD = "user_left_board"

    # Notification events
    TASK_ASSIGNED = "task_assigned"
    TASK_MENTIONED = "task_mentioned"
    COMMENT_MENTIONED = "comment_mentioned"

def create_event_message(event_type: str, data: dict, board_id: int = None, user_id: int = None) -> dict:
    """Create a standardized WebSocket message"""
    message = {
        "type": event_type,
        "timestamp": asyncio.get_event_loop().time(),
        "data": data
    }

    if board_id:
        message["board_id"] = board_id
    if user_id:
        message["user_id"] = user_id

    return message

async def notify_task_assignment(task_id: int, assignee_id: int, assigned_by_id: int, board_id: int):
    """Notify when a task is assigned to a user"""
    message = create_event_message(
        WebSocketEvent.TASK_ASSIGNED,
        {
            "task_id": task_id,
            "assignee_id": assignee_id,
            "assigned_by_id": assigned_by_id
        },
        board_id=board_id
    )
    await manager.send_personal_message(message, assignee_id)

async def notify_task_mention(task_id: int, mentioned_user_id: int, mentioned_by_id: int, board_id: int):
    """Notify when a user is mentioned in a task"""
    message = create_event_message(
        WebSocketEvent.TASK_MENTIONED,
        {
            "task_id": task_id,
            "mentioned_user_id": mentioned_user_id,
            "mentioned_by_id": mentioned_by_id
        },
        board_id=board_id
    )
    await manager.send_personal_message(message, mentioned_user_id)

async def notify_comment_mention(comment_id: int, mentioned_user_id: int, mentioned_by_id: int, board_id: int):
    """Notify when a user is mentioned in a comment"""
    message = create_event_message(
        WebSocketEvent.COMMENT_MENTIONED,
        {
            "comment_id": comment_id,
            "mentioned_user_id": mentioned_user_id,
            "mentioned_by_id": mentioned_by_id
        },
        board_id=board_id
    )
    await manager.send_personal_message(message, mentioned_user_id)

