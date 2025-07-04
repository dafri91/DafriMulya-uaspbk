// store/cart.js
import { defineStore } from 'pinia'
import { db, ref, get, set } from '../firebase'

export const useCartStore = defineStore('cart', {
  state: () => ({
    userId: null,
    items: []
  }),

  getters: {
    itemCount: (state) => state.items.reduce((sum, item) => sum + item.quantity, 0),
    totalPrice: (state) => state.items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    isEmpty: (state) => state.items.length === 0
  },

  actions: {
    async initCart(uid) {
      if (!uid) return
      this.userId = uid
      const cartRef = ref(db, `carts/${uid}`)
      const snapshot = await get(cartRef)
      this.items = snapshot.exists() ? snapshot.val() : []
    },

    async saveCart() {
      if (!this.userId) return
      await set(ref(db, `carts/${this.userId}`), this.items)
    },

    async addToCart(product, quantity = 1) {
      const existing = this.items.find(item => item.id === product.id)
      if (existing) {
        existing.quantity += quantity
      } else {
        this.items.push({ ...product, quantity })
      }
      await this.saveCart()
    },

    async updateQuantity(productId, qty) {
      const item = this.items.find(item => item.id === productId)
      if (item) {
        item.quantity = qty
        await this.saveCart()
      }
    },

    async removeFromCart(productId) {
      this.items = this.items.filter(item => item.id !== productId)
      await this.saveCart()
    },

    async clearCart() {
      this.items = []
      await this.saveCart()
    }
  }
})
