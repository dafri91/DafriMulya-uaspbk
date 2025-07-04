import { defineStore } from 'pinia'
import { db, ref, get, push, set, update, remove } from '../firebase'

export const useProductsStore = defineStore('products', {
  state: () => ({
    products: [],
    categories: [], // ✅ Tambahkan state categories
    loading: false,
    error: null
  }),

  actions: {
    // ✅ Fetch semua produk
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

    // ✅ Tambahkan produk
    async addProduct(productData) {
      this.loading = true
      try {
        const newRef = push(ref(db, 'products'))
        await set(newRef, productData)
        await this.fetchProducts()
      } catch (e) {
        this.error = e.message
      } finally {
        this.loading = false
      }
    },

    // ✅ Update produk
    async updateProduct(id, productData) {
      await update(ref(db, 'products/' + id), productData)
      await this.fetchProducts()
    },

    // ✅ Hapus produk
    async deleteProduct(id) {
      await remove(ref(db, 'products/' + id))
      await this.fetchProducts()
    },

    // ✅ Fetch kategori
    async fetchCategories() {
      this.loading = true
      this.error = null
      try {
        const snapshot = await get(ref(db, 'categories'))
        if (snapshot.exists()) {
          this.categories = Object.entries(snapshot.val()).map(([id, val]) => ({ id, ...val }))
        }
      } catch (e) {
        this.error = e.message
      } finally {
        this.loading = false
      }
    },

    // ✅ Opsional: set selected category (kalau dipakai)
    setSelectedCategory(categoryName) {
      this.selectedCategory = categoryName
    }
  }
})
