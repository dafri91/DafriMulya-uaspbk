// src/store/favorites.js
import { defineStore } from 'pinia'
import { db, ref, get, push, set, remove } from '../firebase'
import { useAuthStore } from './auth'

export const useFavoritesStore = defineStore('favorites', {
  state: () => ({
    favorites: [],
    loading: false,
    error: null
  }),

  getters: {
    isFavorite: (state) => (productId) => state.favorites.some(fav => fav.productId === productId),
    favoriteCount: (state) => state.favorites.length
  },

  actions: {
    async fetchFavorites() {
      const authStore = useAuthStore()
      if (!authStore.isAuthenticated) return

      this.loading = true
      this.error = null

      try {
        const snapshot = await get(ref(db, `favorites/${authStore.user.uid}`))
        if (snapshot.exists()) {
          this.favorites = Object.entries(snapshot.val()).map(([id, val]) => ({ id, ...val }))
        } else {
          this.favorites = []
        }
      } catch (e) {
        this.error = e.message
      } finally {
        this.loading = false
      }
    },

    async addToFavorites(product) {
      const authStore = useAuthStore()
      if (!authStore.isAuthenticated) {
        this.error = 'Please login to add favorites'
        return
      }

      this.loading = true
      this.error = null

      try {
        const newRef = push(ref(db, `favorites/${authStore.user.uid}`))
        const favoriteItem = {
          productId: product.id,
          product, // ⬅️ Simpan seluruh produk
          createdAt: new Date().toISOString()
        }
        await set(newRef, favoriteItem)
        await this.fetchFavorites()
      } catch (e) {
        this.error = e.message
      } finally {
        this.loading = false
      }
    },

    async removeFromFavorites(productId) {
      const authStore = useAuthStore()
      if (!authStore.isAuthenticated) return

      this.loading = true
      this.error = null

      try {
        const snapshot = await get(ref(db, `favorites/${authStore.user.uid}`))
        if (snapshot.exists()) {
          const entries = Object.entries(snapshot.val())
          const match = entries.find(([id, val]) => val.productId === productId)
          if (match) {
            await remove(ref(db, `favorites/${authStore.user.uid}/${match[0]}`))
          }
        }
        await this.fetchFavorites()
      } catch (e) {
        this.error = e.message
      } finally {
        this.loading = false
      }
    },

    async toggleFavorite(product) {
      if (this.isFavorite(product.id)) {
        await this.removeFromFavorites(product.id)
      } else {
        await this.addToFavorites(product)
      }
    },

    loadFromLocalStorage() {
      console.log('Favorites are stored in Firebase, no local storage needed.')
    }
  }
})
