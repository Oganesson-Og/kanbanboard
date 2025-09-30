export interface User {
  id: number
  email: string
  username: string
  full_name: string
  is_active: boolean
  created_at: string
}

export interface Board {
  id: number
  name: string
  description?: string
  created_by: number
  is_active: boolean
  created_at: string
  columns: Column[]
}

export interface Column {
  id: number
  name: string
  board_id: number
  position: number
  tasks: Task[]
}

export interface Tag {
  id: string
  name: string
  color: string
}

export interface Task {
  id: number
  title: string
  description?: string
  board_id: number
  column_id: number
  assignee_id?: number
  priority: 'low' | 'medium' | 'high' | 'urgent'
  tags: string[]
  due_date?: string
  estimated_hours?: number
  hours_used?: number
  completed_hours?: number
  created_by: number
  position: number
  is_active: boolean
  created_at: string
  assignee?: User
  comments: Comment[]
}

export interface Comment {
  id: number
  content: string
  task_id: number
  author_id: number
  created_at: string
  author: User
}

export interface CreateBoardRequest {
  name: string
  description?: string
}

export interface CreateColumnRequest {
  name: string
  position: number
}

export interface CreateTaskRequest {
  title: string
  description?: string
  column_id: number
  assignee_id?: number
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  tags?: string[]  // Array of tag names
  due_date?: string
  estimated_hours?: number
  hours_used?: number
  completed_hours?: number
}

export interface CreateCommentRequest {
  content: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  username: string
  full_name: string
  password: string
}

export interface AuthResponse {
  access_token: string
  token_type: string
  user: User
}

// WebSocket message types
export interface WebSocketMessage {
  type: 'task_created' | 'task_updated' | 'task_deleted' | 'task_moved'
  board_id: number
  data: any
}
