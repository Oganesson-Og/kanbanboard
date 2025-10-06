import axios from 'axios'
import {
  Board,
  Column,
  Task,
  Comment,
  CreateBoardRequest,
  CreateColumnRequest,
  CreateTaskRequest,
  CreateCommentRequest,
  User
} from '../types'

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)


// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token')
      localStorage.removeItem('user')
      // Instead of redirecting to /login, just reload the page
      // This will trigger the AuthContext to show the login component
      window.location.reload()
    }
    return Promise.reject(error)
  }
)

export const authAPI = {
  login: async (credentials: { email: string; password: string }) => {
    const response = await api.post('/auth/login', credentials)
    return response.data
  },

  register: async (userData: { email: string; username: string; full_name: string; password: string }) => {
    const response = await api.post('/auth/register', userData)
    return response.data
  },
}

export const boardAPI = {
  getBoards: async (): Promise<Board[]> => {
    const response = await api.get('/boards')
    return response.data
  },

  createBoard: async (boardData: CreateBoardRequest): Promise<Board> => {
    const response = await api.post('/boards', boardData)
    return response.data
  },

  getBoard: async (boardId: number): Promise<Board> => {
    const response = await api.get(`/boards/${boardId}`)
    return response.data
  },

  deleteBoard: async (boardId: number): Promise<void> => {
    await api.delete(`/boards/${boardId}`)
  },
}

export const userAPI = {
  getUsers: async (): Promise<User[]> => {
    const response = await api.get('/users')
    return response.data
  },
  createUser: async (userData: { email: string; username: string; full_name: string; password: string }): Promise<User> => {
    // Use the same register endpoint as login/register screen
    const response = await api.post('/auth/register', userData)
    return response.data.user
  },
}

export const columnAPI = {
  createColumn: async (boardId: number, columnData: CreateColumnRequest): Promise<Column> => {
    const response = await api.post(`/boards/${boardId}/columns`, columnData)
    return response.data
  },

  updateColumn: async (columnId: number, columnData: CreateColumnRequest): Promise<Column> => {
    const response = await api.put(`/columns/${columnId}`, columnData)
    return response.data
  },

  deleteColumn: async (columnId: number): Promise<void> => {
    await api.delete(`/columns/${columnId}`)
  },
}

export const taskAPI = {
  createTask: async (boardId: number, taskData: CreateTaskRequest): Promise<Task> => {
    const response = await api.post(`/boards/${boardId}/tasks`, taskData)
    return response.data
  },

  getTask: async (taskId: number): Promise<Task> => {
    const response = await api.get(`/tasks/${taskId}`)
    return response.data
  },

  updateTask: async (taskId: number, taskData: Partial<CreateTaskRequest>): Promise<Task> => {
    const response = await api.put(`/tasks/${taskId}`, taskData)
    return response.data
  },

  deleteTask: async (taskId: number): Promise<void> => {
    await api.delete(`/tasks/${taskId}`)
  },

  moveTask: async (taskId: number, newColumnId: number, newPosition: number): Promise<Task> => {
    const response = await api.put(`/tasks/${taskId}/move`, {
      column_id: newColumnId,
      position: newPosition
    })
    return response.data
  },
}

export const commentAPI = {
  getTaskComments: async (taskId: number): Promise<Comment[]> => {
    const response = await api.get(`/tasks/${taskId}/comments`)
    return response.data
  },

  createComment: async (taskId: number, commentData: CreateCommentRequest): Promise<Comment> => {
    const response = await api.post(`/tasks/${taskId}/comments`, commentData)
    return response.data
  },

  updateComment: async (commentId: number, commentData: CreateCommentRequest): Promise<Comment> => {
    const response = await api.put(`/comments/${commentId}`, commentData)
    return response.data
  },

  deleteComment: async (commentId: number): Promise<void> => {
    await api.delete(`/comments/${commentId}`)
  },
}

export default api
