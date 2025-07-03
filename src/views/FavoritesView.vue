<script setup>
import { onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useFavoritesStore } from '../store/favorites'
import { useAuthStore } from '../store/auth'
import ProductCard from '../components/ProductCard.vue'

const router = useRouter()
const favoritesStore = useFavoritesStore()
const authStore = useAuthStore()

const favoriteProducts = computed(() => {
  return favoritesStore.favorites.map(fav => fav.product).filter(Boolean)
})

onMounted(async () => {
  if (!authStore.isAuthenticated) {
    router.push('/login')
    return
  }
  
  await favoritesStore.fetchFavorites()
})

const continueShopping = () => {
  router.push('/products')
}
</script>


<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <h1 class="text-3xl font-bold text-gray-900 mb-8">My Favorites</h1>

    <!-- Login Required -->
    <div v-if="!authStore.isAuthenticated" class="text-center py-12">
      <svg class="mx-auto h-24 w-24 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
      <h2 class="text-2xl font-semibold text-gray-900 mb-2">Login Required</h2>
      <p class="text-gray-600 mb-8">Please login to view your favorite products</p>
      <router-link
        to="/login"
        class="bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition duration-150"
      >
        Login
      </router-link>
    </div>

    <!-- Loading State -->
    <div v-else-if="favoritesStore.loading" class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>

    <!-- Empty Favorites -->
    <div v-else-if="favoriteProducts.length === 0" class="text-center py-12">
      <svg class="mx-auto h-24 w-24 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
      <h2 class="text-2xl font-semibold text-gray-900 mb-2">No favorites yet</h2>
      <p class="text-gray-600 mb-8">Start adding products to your favorites!</p>
      <button
        @click="continueShopping"
        class="bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition duration-150"
      >
        Browse Products
      </button>
    </div>

    <!-- Favorites Grid -->
    <div v-else>
      <div class="mb-6">
        <p class="text-gray-600">{{ favoriteProducts.length }} favorite products</p>
      </div>
      
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <ProductCard
          v-for="product in favoriteProducts"
          :key="product.id"
          :product="product"
        />
      </div>
    </div>
  </div>
</template>