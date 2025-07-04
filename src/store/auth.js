import { defineStore } from 'pinia'
import { auth, db, ref, set, get } from '../firebase'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from 'firebase/auth'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user')) || null,
    loading: false,
    error: null
  }),

  getters: {
    isAuthenticated: (state) => !!state.user,
    isAdmin: (state) => state.user?.role === 'admin'
  },

  actions: {
    async register({ firstName, lastName, email, password }) {
      this.loading = true
      this.error = null
      try {
        const cred = await createUserWithEmailAndPassword(auth, email, password)
        const uid = cred.user.uid

        const userData = {
          uid,
          email,
          firstName,
          lastName,
          role: 'user',
          createdAt: new Date().toISOString()
        }

        await set(ref(db, 'users/' + uid), userData)

        this.user = userData
        localStorage.setItem('user', JSON.stringify(userData))

        return { success: true }
      } catch (e) {
        this.error = e.message
        return { success: false, error: e.message }
      } finally {
        this.loading = false
      }
    },

    async login(email, password) {
      this.loading = true
      this.error = null
      try {
        const cred = await signInWithEmailAndPassword(auth, email, password)
        const uid = cred.user.uid

        const snapshot = await get(ref(db, 'users/' + uid))
        if (snapshot.exists()) {
          this.user = snapshot.val()
          localStorage.setItem('user', JSON.stringify(this.user))
          return { success: true }
        } else {
          this.error = 'User data not found in database.'
          return { success: false, error: this.error }
        }
      } catch (e) {
        this.error = e.message
        return { success: false, error: e.message }
      } finally {
        this.loading = false
      }
    },

    async logout() {
      await signOut(auth)
      this.user = null
      localStorage.removeItem('user')
    },

    loadFromLocal() {
      const u = localStorage.getItem('user')
      this.user = u ? JSON.parse(u) : null
    },

    //  Tambahan: Fungsi update profil user
    async updateUser(updatedData) {
      if (!this.user || !this.user.uid) return false

      try {
        const newUser = {
          ...this.user,
          ...updatedData
        }

        await set(ref(db, 'users/' + this.user.uid), newUser)
        this.user = newUser
        localStorage.setItem('user', JSON.stringify(this.user))
        return true
      } catch (e) {
        console.error('Failed to update user:', e)
        return false
      }
    }
  }
})
