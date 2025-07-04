import { defineStore } from 'pinia'
import { auth, db, ref, set, get } from '../firebase'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth'

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
    async register(email, password, name) {
      this.loading = true
      this.error = null
      try {
        const cred = await createUserWithEmailAndPassword(auth, email, password)
        const uid = cred.user.uid

        await set(ref(db, 'users/' + uid), {
          uid,
          email,
          name,
          role: 'user',
          createdAt: new Date().toISOString()
        })

        this.user = { uid, email, name, role: 'user' }
        localStorage.setItem('user', JSON.stringify(this.user))
      } catch (e) {
        this.error = e.message
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
        } else {
          this.error = 'User data not found in database.'
        }
      } catch (e) {
        this.error = e.message
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
    }
  }
})
