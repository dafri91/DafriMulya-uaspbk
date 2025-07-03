import { defineStore } from 'pinia'
import axios from 'axios'

const API_URL = 'http://localhost:3001'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user') || 'null'),
    isAuthenticated: !!localStorage.getItem('user'),
    loading: false,
    error: null
  }),

  getters: {
    isAdmin: (state) => state.user?.role === 'admin',
    isUser: (state) => state.user?.role === 'user'
  },

  actions: {
    async login(email, password) {
      this.loading = true
      this.error = null
      
      try {
        const response = await axios.get(`${API_URL}/users`)
        const user = response.data.find(u => u.email === email && u.password === password)
        
        if (user) {
          this.user = user
          this.isAuthenticated = true
          localStorage.setItem('user', JSON.stringify(user))
          return { success: true }
        } else {
          this.error = 'Invalid email or password'
          return { success: false, error: this.error }
        }
      } catch (error) {
        this.error = 'Login failed. Please try again.'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    async register(userData) {
      this.loading = true
      this.error = null
      
      try {
        // Check if user already exists
        const existingUsers = await axios.get(`${API_URL}/users`)
        const userExists = existingUsers.data.find(u => u.email === userData.email)
        
        if (userExists) {
          this.error = 'User with this email already exists'
          return { success: false, error: this.error }
        }

        const newUser = {
          ...userData,
          id: Date.now(),
          role: 'user',
          createdAt: new Date().toISOString()
        }

        await axios.post(`${API_URL}/users`, newUser)
        
        this.user = newUser
        this.isAuthenticated = true
        localStorage.setItem('user', JSON.stringify(newUser))
        
        return { success: true }
      } catch (error) {
        this.error = 'Registration failed. Please try again.'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    logout() {
      this.user = null
      this.isAuthenticated = false
      localStorage.removeItem('user')
    },

    clearError() {
      this.error = null
    }
  }
})