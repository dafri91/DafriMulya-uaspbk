import { defineStore } from 'pinia'
import { db, ref, get, push, set, update, remove } from '../firebase'

export const useProductsStore = defineStore('products', {
  state: () => ({
    products: [],
    loading: false,
    error: null
  }),

  actions: {
    async fetchProducts() {
      this.loading = true
      this.error = null
      try {
        const snapshot = await get(ref(db, 'products'))
        if (snapshot.exists()) {
          this.products = Object.entries(snapshot.val()).map(([id, val]) => ({ id, ...val }))
        }
      } catch (e) {
        this.error = e.message
      } finally {
        this.loading = false
      }
    },

    async addProduct(productData) {
      this.loading = true
      try {
        const newRef = push(ref(db, 'products'))
        await set(newRef, productData)
        this.fetchProducts()
      } catch (e) {
        this.error = e.message
      } finally {
        this.loading = false
      }
    },

    async updateProduct(id, productData) {
      await update(ref(db, 'products/' + id), productData)
      this.fetchProducts()
    },

    async deleteProduct(id) {
      await remove(ref(db, 'products/' + id))
      this.fetchProducts()
    }
  }
})
