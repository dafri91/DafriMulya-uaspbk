import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '../src/store/auth'

// Mock axios
const mockUsers = [
  {
    id: 1,
    email: 'user@test.com',
    password: '123456',
    firstName: 'Test',
    lastName: 'User',
    role: 'user'
  },
  {
    id: 2,
    email: 'admin@test.com',
    password: 'admin123',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin'
  }
]

// Mock axios
vi.mock('axios', () => ({
  default: {
    get: vi.fn(() => Promise.resolve({ data: mockUsers })),
    post: vi.fn(() => Promise.resolve({ data: { id: 3, email: 'new@test.com', role: 'user' } }))
  }
}))

describe('Auth Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    // Clear localStorage
    localStorage.clear()
  })

  it('should login with valid credentials', async () => {
    const authStore = useAuthStore()
    
    const result = await authStore.login('user@test.com', '123456')
    
    expect(result.success).toBe(true)
    expect(authStore.isAuthenticated).toBe(true)
    expect(authStore.user.email).toBe('user@test.com')
    expect(authStore.user.role).toBe('user')
  })

  it('should fail login with invalid credentials', async () => {
    const authStore = useAuthStore()
    
    const result = await authStore.login('wrong@email.com', 'wrongpass')
    
    expect(result.success).toBe(false)
    expect(authStore.isAuthenticated).toBe(false)
    expect(authStore.error).toBe('Invalid email or password')
  })

  it('should identify admin user correctly', async () => {
    const authStore = useAuthStore()
    
    await authStore.login('admin@test.com', 'admin123')
    
    expect(authStore.isAdmin).toBe(true)
    expect(authStore.isUser).toBe(false)
  })

  it('should identify regular user correctly', async () => {
    const authStore = useAuthStore()
    
    await authStore.login('user@test.com', '123456')
    
    expect(authStore.isAdmin).toBe(false)
    expect(authStore.isUser).toBe(true)
  })

  it('should logout successfully', async () => {
    const authStore = useAuthStore()
    
    // Login first
    await authStore.login('user@test.com', '123456')
    expect(authStore.isAuthenticated).toBe(true)
    
    // Then logout
    authStore.logout()
    
    expect(authStore.isAuthenticated).toBe(false)
    expect(authStore.user).toBe(null)
  })
})