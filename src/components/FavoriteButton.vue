<!-- components/FavoriteButton.vue -->
<script setup>
import { computed } from 'vue'
import { useFavoritesStore } from '../store/favorites'
import { useAuthStore } from '../store/auth'

const props = defineProps({
  product: {
    type: Object,
    required: true
  }
})

const favoritesStore = useFavoritesStore()
const authStore = useAuthStore()

// Cek apakah produk ini sudah ada di daftar favorit
const isFavorited = computed(() => favoritesStore.isFavorite(props.product.id))

// Toggle favorite (tambahkan/hapus)
const toggleFavorite = async (event) => {
  event.stopPropagation()

  if (!authStore.isAuthenticated) {
    alert('Please login to manage favorites.')
    return
  }

  await favoritesStore.toggleFavorite(props.product)
}
</script>

<template>
  <button
    @click="toggleFavorite"
    :class="[
      'p-2 rounded-full transition-all duration-200 transform hover:scale-110',
      isFavorited
        ? 'bg-red-500 text-white shadow-lg'
        : 'bg-white/80 text-gray-600 hover:bg-white hover:text-red-500 backdrop-blur-sm'
    ]"
    :title="isFavorited ? 'Remove from favorites' : 'Add to favorites'"
  >
    <svg
      class="w-5 h-5"
      :fill="isFavorited ? 'currentColor' : 'none'"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
      />
    </svg>
  </button>
</template>
