import { defineStore } from 'pinia'
import axios from 'axios'
import { useAuthStore } from './auth'

const API_URL = 'http://localhost:3001'

export const useFavoritesStore = defineStore('favorites', {
  state: () => ({
    favorites: JSON.parse(localStorage.getItem('favorites') || '[]'),
    loading: false,
    error: null
  }),

  getters: {
    isFavorite: (state) => (productId) => state.favorites.some(fav => fav.productId === productId),
    
    favoriteCount: (state) => state.favorites.length
  },

  actions: {
    async addToFavorites(product) {
      const authStore = useAuthStore()
      
      if (!authStore.isAuthenticated) {
        this.error = 'Please login to add favorites'
        return { success: false, error: this.error }
      }

      const favoriteItem = {
        id: Date.now(),
        productId: product.id,
        userId: authStore.user.id,
        product: {
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          brand: product.brand
        },
        createdAt: new Date().toISOString()
      }

      try {
        await axios.post(`${API_URL}/favorites`, favoriteItem)
        this.favorites.push(favoriteItem)
        this.saveToLocalStorage()
        return { success: true }
      } catch (error) {
        // Fallback to localStorage for demo
        this.favorites.push(favoriteItem)
        this.saveToLocalStorage()
        return { success: true }
      }
    },

    async removeFromFavorites(productId) {
      const authStore = useAuthStore()
      const favorite = this.favorites.find(fav => fav.productId === productId)
      
      if (!favorite) return

      try {
        await axios.delete(`${API_URL}/favorites/${favorite.id}`)
        this.favorites = this.favorites.filter(fav => fav.productId !== productId)
        this.saveToLocalStorage()
        return { success: true }
      } catch (error) {
        // Fallback to localStorage for demo
        this.favorites = this.favorites.filter(fav => fav.productId !== productId)
        this.saveToLocalStorage()
        return { success: true }
      }
    },

    async toggleFavorite(product) {
      if (this.isFavorite(product.id)) {
        return await this.removeFromFavorites(product.id)
      } else {
        return await this.addToFavorites(product)
      }
    },

    async fetchFavorites() {
      const authStore = useAuthStore()
      
      if (!authStore.isAuthenticated) return

      this.loading = true
      try {
        const response = await axios.get(`${API_URL}/favorites?userId=${authStore.user.id}`)
        this.favorites = response.data
        this.saveToLocalStorage()
      } catch (error) {
        // Use localStorage data for demo
        console.error('Error fetching favorites:', error)
      } finally {
        this.loading = false
      }
    },

    saveToLocalStorage() {
      localStorage.setItem('favorites', JSON.stringify(this.favorites))
    },

    loadFromLocalStorage() {
      const stored = localStorage.getItem('favorites')
      if (stored) {
        this.favorites = JSON.parse(stored)
      }
    }
  }
})