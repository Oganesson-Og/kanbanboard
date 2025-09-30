import { WebSocketMessage } from '../types'

class WebSocketService {
  private ws: WebSocket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectInterval = 5000
  private listeners: { [event: string]: ((data: any) => void)[] } = {}
  private boardId: number | null = null
  private token: string | null = null
  private shouldReconnect = true

  constructor() {
    this.listeners = {}
  }

  connect(boardId: number, token: string) {
    // Avoid duplicate connections to the same board/token
    if (
      this.ws &&
      (this.ws.readyState === WebSocket.CONNECTING || this.ws.readyState === WebSocket.OPEN) &&
      this.boardId === boardId &&
      this.token === token
    ) {
      return
    }

    // Close any existing socket before establishing a new one
    if (this.ws && this.ws.readyState !== WebSocket.CLOSED && this.ws.readyState !== WebSocket.CLOSING) {
      this.shouldReconnect = false
      try { this.ws.close() } catch {}
    }

    this.boardId = boardId
    this.token = token
    this.shouldReconnect = true

    const wsUrl = `${this.getWebSocketBaseUrl()}/ws/${boardId}?token=${encodeURIComponent(token)}`

    this.ws = new WebSocket(wsUrl)

    this.ws.onopen = (event) => {
      console.log('WebSocket connected:', event)
      this.reconnectAttempts = 0
      this.emit('connected', { boardId })
    }

    this.ws.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data)
        console.log('WebSocket message received:', message)
        this.emit(message.type, message.data)
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error)
      }
    }

    this.ws.onclose = (event) => {
      console.log('WebSocket disconnected:', event)
      this.emit('disconnected', { boardId, reason: event.reason })
      if (this.shouldReconnect) {
        this.attemptReconnect()
      }
    }

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error)
      this.emit('error', error)
    }
  }

  disconnect() {
    if (this.ws) {
      this.shouldReconnect = false
      try { this.ws.close() } catch {}
      this.ws = null
    }
    this.boardId = null
    this.token = null
  }

  private getWebSocketBaseUrl(): string {
    const apiUrl = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000'
    return apiUrl.replace(/^http/, 'ws')
  }

  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts || !this.boardId || !this.token) {
      console.log('Max reconnect attempts reached or no connection info available')
      return
    }

    this.reconnectAttempts++
    console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`)

    setTimeout(() => {
      this.connect(this.boardId!, this.token!)
    }, this.reconnectInterval)
  }

  send(event: string, data: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const message = {
        type: event,
        data: data,
        timestamp: new Date().toISOString()
      }
      this.ws.send(JSON.stringify(message))
    } else {
      console.warn('WebSocket is not connected, cannot send message:', event, data)
    }
  }

  // Event listener management
  on(event: string, callback: (data: any) => void) {
    if (!this.listeners[event]) {
      this.listeners[event] = []
    }
    this.listeners[event].push(callback)
  }

  off(event: string, callback: (data: any) => void) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback)
    }
  }

  private emit(event: string, data: any) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(data))
    }
  }

  // Connection status
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN
  }

  getConnectionState(): number {
    return this.ws?.readyState || WebSocket.CLOSED
  }
}

// Export singleton instance
export const websocketService = new WebSocketService()
export default websocketService

