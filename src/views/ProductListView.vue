<script setup>
import { onMounted, computed, ref, watch, onUnmounted } from 'vue'
import { useProductsStore } from '../store/products'
import ProductCard from '../components/ProductCard.vue'

const productsStore = useProductsStore()
const showMobileFilters = ref(false)

onMounted(async () => {
  await productsStore.fetchProducts()
  await productsStore.fetchCategories()
})

const handleClearFilters = () => {
  productsStore.clearFilters()
  showMobileFilters.value = false
}

// Pakai hasil yang sudah di-sort dan filter dari store
const sortedProducts = computed(() => productsStore.sortedAndFilteredProducts)

watch(showMobileFilters, (newVal) => {
  if (newVal) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})

// Clean up when component unmount
onUnmounted(() => {
  document.body.style.overflow = ''
})
</script>



<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

    <!-- MOBILE: Filter Button -->
<!-- TABLET ONLY: Filter Button -->
<div class="hidden md:flex lg:hidden justify-end mb-4">
  <button
    @click="showMobileFilters = true"
    class="text-primary font-medium border border-primary px-4 py-2 rounded-lg hover:bg-primary hover:text-white transition"
  >
    Show Filters
  </button>
</div>


    <div class="flex flex-col lg:flex-row gap-8">

      <!-- DESKTOP: Sidebar -->
      <div class="hidden lg:block lg:w-1/4">
        <FilterSidebar
          :productsStore="productsStore"
          @clear="handleClearFilters"
        />
      </div>

      <!-- PRODUCTS -->
      <div class="w-full lg:w-3/4">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Products</h1>
            <p class="text-gray-600">{{ sortedProducts.length }} products found</p>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="productsStore.loading" class="flex justify-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>

        <!-- Empty State -->
        <div v-else-if="sortedProducts.length === 0" class="text-center py-12">
          <p class="text-lg text-gray-600">No products found. Try adjusting your filters.</p>
          <button
            @click="handleClearFilters"
            class="mt-4 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition"
          >
            Clear Filters
          </button>
        </div>

        <!-- Product Grid -->
        <div v-else class="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
          <ProductCard
            v-for="product in sortedProducts"
            :key="product.id"
            :product="product"
          />
        </div>
      </div>
    </div>

    <!-- MOBILE: Modal Overlay Filter -->
<!-- MOBILE: Modal Overlay Filter -->
<transition name="fade">
  <div v-if="showMobileFilters" class="fixed inset-0 z-50 flex flex-col">
    
 <!-- Modal panel (top half) -->
<div class="bg-white w-full h-1/2 max-h-[50vh] rounded-b-2xl shadow-lg overflow-hidden flex flex-col">
  <!-- Header -->
  <div class="flex justify-between items-center p-4 border-b flex-none">
    <h2 class="text-xl font-bold text-gray-900">Filters</h2>
    <button
      @click="showMobileFilters = false"
      class="text-gray-600 hover:text-black text-2xl"
    >
      ✕
    </button>
  </div>

  <!-- Body Scrollable Content -->
  <div class="flex-1 overflow-y-auto overscroll-contain p-4">
    <FilterSidebar
      :productsStore="productsStore"
      @clear="handleClearFilters"
    />
  </div>
</div>



    <!-- Backdrop clickable area (remaining bottom half) -->
    <div
      class="flex-1 bg-black/50"
      @click="showMobileFilters = false"
    ></div>
  </div>
</transition>

  </div>
</template>

<script>
import FilterSidebar from '../components/FilterSidebar.vue'
</script>

<style>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}
</style>
