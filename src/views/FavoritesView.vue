<script setup>
import { onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useFavoritesStore } from '../store/favorites'
import { useAuthStore } from '../store/auth'
import ProductCard from '../components/ProductCard.vue'

const router = useRouter()
const favoritesStore = useFavoritesStore()
const authStore = useAuthStore()

// Langsung akses product dari favorite yang sudah disimpan
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

    <!-- Loading -->
    <div v-if="favoritesStore.loading" class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>

    <!-- Empty -->
    <div v-else-if="favoriteProducts.length === 0" class="text-center py-12">
      <h2 class="text-2xl font-semibold text-gray-900 mb-2">No favorites yet</h2>
      <p class="text-gray-600 mb-8">Start adding products to your favorites!</p>
      <button @click="continueShopping"
        class="bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition duration-150">
        Browse Products
      </button>
    </div>

    <!-- Product Grid -->
    <div v-else>
      <p class="text-gray-600 mb-4">{{ favoriteProducts.length }} favorite products</p>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <ProductCard v-for="product in favoriteProducts" :key="product.id" :product="product" />
      </div>
    </div>
  </div>
</template>
