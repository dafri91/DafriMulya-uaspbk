import { defineStore } from 'pinia'
import axios from 'axios'

const API_URL = 'http://localhost:3001'

export const useProductsStore = defineStore('products', {
  state: () => ({
    products: [],
    categories: [],
    currentProduct: null,
    loading: false,
    error: null,
    searchQuery: '',
    selectedCategory: '',
    selectedBrand: '',
    sortOption: 'default'
  }),

  getters: {
filteredProducts(state) {
  let filtered = [...state.products];

  if (state.searchQuery) {
    // Kamus sinonim (Indonesia ➜ Inggris)
    const synonyms = {
      'hp': 'smartphones',
      'handphone': 'smartphones',
      'smartphone': 'smartphones',
      'laptop': 'laptops',
      'notebook': 'laptops',
      'audio': 'audio',
      'tablet': 'tablets',
      'aksesori': 'accessories',
      'aksesoris': 'accessories'
    };

    // Normalisasi query
    let query = state.searchQuery.toLowerCase().trim();

    // Ganti jika query persis cocok di kamus sinonim
    if (synonyms[query]) {
      query = synonyms[query];
    }

    // Dukungan multi-word (contoh: "apple laptop")
    const words = query.split(/\s+/);

    filtered = filtered.filter(product =>
      words.every(word => {
        const w = synonyms[word] || word;
        return (
          product.name.toLowerCase().includes(w) ||
          product.brand.toLowerCase().includes(w) ||
          product.category.toLowerCase().includes(w)
        );
      })
    );
  }

  // Filter by category
  if (state.selectedCategory) {
    filtered = filtered.filter(product => product.category === state.selectedCategory);
  }

  // Filter by brand
  if (state.selectedBrand) {
    filtered = filtered.filter(product => product.brand === state.selectedBrand);
  }

  return filtered;
},

    sortedAndFilteredProducts(state) {
      let result = [...(this.filteredProducts || [])]

      if (state.sortOption === 'priceLow') {
        result.sort((a, b) => a.price - b.price)
      } else if (state.sortOption === 'priceHigh') {
        result.sort((a, b) => b.price - a.price)
      }

      return result
    },

    featuredProducts: (state) => state.products.filter(product => product.featured),

    brands: (state) => [...new Set(state.products.map(product => product.brand))],

    getRecommendations: (state) => (productId) => {
      const product = state.products.find(p => p.id === productId)
      if (!product || !product.recommendations) return []
      return product.recommendations.map(id => state.products.find(p => p.id === id)).filter(Boolean)
    }
  },

  actions: {
    async fetchProducts() {
      this.loading = true
      try {
        const response = await axios.get(`${API_URL}/products`)
        this.products = response.data
      } catch (error) {
        this.error = 'Failed to fetch products'
        console.error('Error fetching products:', error)
      } finally {
        this.loading = false
      }
    },

    async fetchCategories() {
      try {
        const response = await axios.get(`${API_URL}/categories`)
        this.categories = response.data
      } catch (error) {
        this.error = 'Failed to fetch categories'
        console.error('Error fetching categories:', error)
      }
    },

    async fetchProduct(id) {
      this.loading = true
      try {
        const response = await axios.get(`${API_URL}/products/${id}`)
        this.currentProduct = response.data
      } catch (error) {
        this.error = 'Failed to fetch product'
        console.error('Error fetching product:', error)
      } finally {
        this.loading = false
      }
    },

    async addProduct(productData) {
      try {
        const newProduct = {
          ...productData,
          id: Date.now(),
          rating: 0,
          reviews: 0,
          inStock: true,
          featured: false,
          recommendations: []
        }
        const response = await axios.post(`${API_URL}/products`, newProduct)
        this.products.push(response.data)
        return { success: true }
      } catch (error) {
        this.error = 'Failed to add product'
        return { success: false, error: this.error }
      }
    },

    async updateProduct(id, productData) {
      try {
        const response = await axios.put(`${API_URL}/products/${id}`, productData)
        const index = this.products.findIndex(p => p.id === id)
        if (index !== -1) {
          this.products[index] = response.data
        }
        return { success: true }
      } catch (error) {
        this.error = 'Failed to update product'
        return { success: false, error: this.error }
      }
    },

    async deleteProduct(id) {
      try {
        await axios.delete(`${API_URL}/products/${id}`)
        this.products = this.products.filter(p => p.id !== id)
        return { success: true }
      } catch (error) {
        this.error = 'Failed to delete product'
        return { success: false, error: this.error }
      }
    },

    setSearchQuery(query) {
      this.searchQuery = query
    },

    setSelectedCategory(category) {
      this.selectedCategory = category
    },

    setSelectedBrand(brand) {
      this.selectedBrand = brand
    },

    setSortOption(option) {
      this.sortOption = option
    },

    clearFilters() {
      this.searchQuery = ''
      this.selectedCategory = ''
      this.selectedBrand = ''
      this.sortOption = 'default'
    }
  }
})
