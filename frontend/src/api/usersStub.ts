import { User } from '../types'

export interface UsersAPI {
  list(): Promise<User[]>
  create(u: Omit<User, 'id' | 'is_active' | 'created_at'> & { capacityHoursPerWeek?: number; role?: string; avatarUrl?: string }): Promise<User>
  delete(id: number, options?: { reassignToId?: number | null }): Promise<void>
  update(id: number, patch: Partial<User>): Promise<User>
}

const key = 'stub_users'

function load(): User[] {
  const raw = localStorage.getItem(key)
  if (!raw) return []
  try { return JSON.parse(raw) as User[] } catch { return [] }
}

function save(users: User[]) {
  localStorage.setItem(key, JSON.stringify(users))
}

let users = load()

export const usersStub: UsersAPI = {
  async list() {
    return [...users]
  },
  async create(u) {
    const id = users.length ? Math.max(...users.map(x => x.id)) + 1 : 1
    const newUser: User = {
      id,
      email: u.email,
      username: u.username,
      full_name: u.full_name,
      is_active: true,
      created_at: new Date().toISOString(),
    }
    users = [...users, newUser]
    save(users)
    return newUser
  },
  async delete(id, _options) {
    users = users.filter(u => u.id !== id)
    save(users)
  },
  async update(id, patch) {
    users = users.map(u => (u.id === id ? { ...u, ...patch } : u))
    save(users)
    const found = users.find(u => u.id === id)!
    return found
  }
}

export default usersStub


