import { defineStore } from 'pinia'
import { db, ref, push, set, get } from '../firebase'
import { useAuthStore } from './auth'

export const useOrdersStore = defineStore('orders', {
  state: () => ({
    orders: [],
    loading: false,
    error: null
  }),

  actions: {
    async createOrder(orderData) {
      this.loading = true
      const authStore = useAuthStore()
      try {
        const newRef = push(ref(db, 'orders'))
        await set(newRef, {
          ...orderData,
          userId: authStore.user.uid,
          createdAt: new Date().toISOString(),
          status: 'pending'
        })
        this.fetchOrders()
      } catch (e) {
        this.error = e.message
      } finally {
        this.loading = false
      }
    },

    async fetchOrders() {
      this.loading = true
      const authStore = useAuthStore()
      try {
        const snapshot = await get(ref(db, 'orders'))
        if (snapshot.exists()) {
          const allOrders = Object.entries(snapshot.val()).map(([id, val]) => ({ id, ...val }))
          this.orders = authStore.isAdmin
            ? allOrders
            : allOrders.filter(o => o.userId === authStore.user.uid)
        }
      } catch (e) {
        this.error = e.message
      } finally {
        this.loading = false
      }
    }
  }
})
