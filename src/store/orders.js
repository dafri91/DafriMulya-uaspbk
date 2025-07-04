import { defineStore } from 'pinia'
import { db, ref, push, set, get, update } from '../firebase'
import { useAuthStore } from './auth'

export const useOrdersStore = defineStore('orders', {
  state: () => ({
    orders: [],
    loading: false,
    error: null
  }),

  getters: {
    userOrders: (state) => {
      const authStore = useAuthStore()
      if (!authStore.user) return []
      return state.orders.filter(order => order.userId === authStore.user.uid)
    }
  },

  actions: {
    async createOrder(orderData) {
      this.loading = true
      this.error = null
      const authStore = useAuthStore()

      try {
        const newRef = push(ref(db, `orders/${authStore.user.uid}`))
        await set(newRef, {
          ...orderData,
          createdAt: new Date().toISOString(),
          status: 'pending'
        })
        await this.fetchOrders()
        return { success: true }
      } catch (e) {
        this.error = e.message
        return { success: false, error: e.message }
      } finally {
        this.loading = false
      }
    },

    async fetchOrders() {
      this.loading = true
      this.error = null
      const authStore = useAuthStore()

      try {
        if (authStore.isAdmin) {
          const snapshot = await get(ref(db, 'orders'))
          if (snapshot.exists()) {
            const allOrders = []
            const ordersData = snapshot.val()

            for (const uid in ordersData) {
              const userOrders = ordersData[uid]
              for (const orderId in userOrders) {
                allOrders.push({
                  id: orderId,
                  userId: uid,
                  ...userOrders[orderId]
                })
              }
            }

            this.orders = allOrders
          } else {
            this.orders = []
          }
        } else {
          const snapshot = await get(ref(db, `orders/${authStore.user.uid}`))
          if (snapshot.exists()) {
            this.orders = Object.entries(snapshot.val()).map(([id, val]) => ({
              id,
              userId: authStore.user.uid,
              ...val
            }))
          } else {
            this.orders = []
          }
        }
      } catch (e) {
        this.error = e.message
      } finally {
        this.loading = false
      }
    },

    // ✅ Tambahan: Update status order (khusus admin)
    async updateOrderStatus(orderId, newStatus) {
      const authStore = useAuthStore()
      if (!authStore.isAdmin) {
        throw new Error('Only admin can update order status')
      }

      try {
        const snapshot = await get(ref(db, 'orders'))
        if (!snapshot.exists()) throw new Error('Orders not found')

        const allOrders = snapshot.val()
        let targetUid = null

        for (const uid in allOrders) {
          if (orderId in allOrders[uid]) {
            targetUid = uid
            break
          }
        }

        if (!targetUid) throw new Error('Order not found')

        await update(ref(db, `orders/${targetUid}/${orderId}`), {
          status: newStatus
        })

        await this.fetchOrders()
      } catch (e) {
        console.error('Failed to update order status:', e)
        this.error = e.message
      }
    }
  }
})
