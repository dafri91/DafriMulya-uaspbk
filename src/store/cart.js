import { defineStore } from 'pinia'
import axios from 'axios'

const API_URL = 'http://localhost:3001'

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: JSON.parse(localStorage.getItem('cart') || '[]'),
    loading: false,
    error: null
  }),

  getters: {
    itemCount: (state) => state.items.reduce((total, item) => total + item.quantity, 0),
    
    totalPrice: (state) => state.items.reduce((total, item) => total + (item.price * item.quantity), 0),
    
    isEmpty: (state) => state.items.length === 0
  },

  actions: {
    addToCart(product, quantity = 1) {
      const existingItem = this.items.find(item => item.id === product.id)
      
      if (existingItem) {
        existingItem.quantity += quantity
      } else {
        this.items.push({
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          brand: product.brand,
          quantity: quantity
        })
      }
      
      this.saveToLocalStorage()
    },

    removeFromCart(productId) {
      this.items = this.items.filter(item => item.id !== productId)
      this.saveToLocalStorage()
    },

    updateQuantity(productId, quantity) {
      const item = this.items.find(item => item.id === productId)
      if (item) {
        if (quantity <= 0) {
          this.removeFromCart(productId)
        } else {
          item.quantity = quantity
          this.saveToLocalStorage()
        }
      }
    },

    clearCart() {
      this.items = []
      this.saveToLocalStorage()
    },

    saveToLocalStorage() {
      localStorage.setItem('cart', JSON.stringify(this.items))
    },

    async syncCart() {
      // In a real app, this would sync with the server
      try {
        const response = await axios.get(`${API_URL}/cart`)
        // For demo purposes, we'll keep using localStorage
      } catch (error) {
        console.error('Error syncing cart:', error)
      }
    }
  }
})