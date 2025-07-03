import { defineStore } from 'pinia'
import axios from 'axios'
import { useAuthStore } from './auth'
import { useCartStore } from './cart'

const API_URL = 'http://localhost:3001'

export const useOrdersStore = defineStore('orders', {
  state: () => ({
    orders: [],
    loading: false,
    error: null
  }),

  getters: {
    userOrders: (state) => {
      const authStore = useAuthStore()
      return state.orders.filter(order => order.userId === authStore.user?.id)
    }
  },

  actions: {
    async createOrder(orderData) {
      const authStore = useAuthStore()
      const cartStore = useCartStore()
      
      if (!authStore.isAuthenticated) {
        this.error = 'Please login to place an order'
        return { success: false, error: this.error }
      }

      this.loading = true
      
      const order = {
        id: Date.now(),
        userId: authStore.user.id,
        items: [...cartStore.items],
        total: cartStore.totalPrice,
        status: 'pending',
        shippingAddress: orderData.shippingAddress,
        paymentMethod: orderData.paymentMethod,
        createdAt: new Date().toISOString(),
        estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      }

      try {
        const response = await axios.post(`${API_URL}/orders`, order)
        this.orders.push(response.data)
        cartStore.clearCart()
        return { success: true, orderId: response.data.id }
      } catch (error) {
        // Fallback for demo
        this.orders.push(order)
        cartStore.clearCart()
        return { success: true, orderId: order.id }
      } finally {
        this.loading = false
      }
    },

    async fetchOrders() {
      const authStore = useAuthStore()
      
      if (!authStore.isAuthenticated) return

      this.loading = true
      try {
        let response
        if (authStore.isAdmin) {
          response = await axios.get(`${API_URL}/orders`)
        } else {
          response = await axios.get(`${API_URL}/orders?userId=${authStore.user.id}`)
        }
        this.orders = response.data
      } catch (error) {
        this.error = 'Failed to fetch orders'
        console.error('Error fetching orders:', error)
      } finally {
        this.loading = false
      }
    },

    async updateOrderStatus(orderId, status) {
      try {
        const order = this.orders.find(o => o.id === orderId)
        if (order) {
          order.status = status
          await axios.put(`${API_URL}/orders/${orderId}`, order)
        }
        return { success: true }
      } catch (error) {
        this.error = 'Failed to update order status'
        return { success: false, error: this.error }
      }
    }
  }
})