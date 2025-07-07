<script setup>
import { onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useProductsStore } from '../store/products'
import HeroSlider from '../components/HeroSlider.vue'
import ProductCard from '../components/ProductCard.vue'

const router = useRouter()
const productsStore = useProductsStore()

onMounted(async () => {
  await productsStore.fetchProducts()
  await productsStore.fetchCategories()
})

const handleShopNow = () => {
  router.push('/products')
}

const handleCategoryClick = (category) => {
  productsStore.setSelectedCategory(category.name)
  router.push('/products')
}

const featuredPreview = computed(() =>
  productsStore.featuredProducts.slice(0, 10)
)
</script>

<template>
  <div>
    <!-- Hero Slider -->
    <HeroSlider @shop-now="handleShopNow" class="mt-8 rounded-sm overflow-hidden shadow-lg" />

    <!-- Categories Section -->
    <section class="py-20 bg-neutral-100">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <h2 class="text-3xl md:text-4xl font-bold text-neutral-900 mb-3">Shop by Category</h2>
          <p class="text-lg text-neutral-600 max-w-2xl mx-auto">
            Explore our curated selection of top-tier electronics.
          </p>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          <div v-for="category in productsStore.categories.filter(c => c.name !== 'All Categories')" :key="category.id"
            @click="handleCategoryClick(category)"
            class="bg-white rounded-xl p-6 text-center cursor-pointer transform hover:-translate-y-1 transition-all duration-300 hover:shadow-lg group border border-transparent hover:border-primary">
            <img :src="category.icon" :alt="category.name"
              class="w-16 h-16 object-contain mx-auto mb-4 transition-transform duration-300 group-hover:scale-110" />
            <h3 class="font-semibold text-neutral-800 mb-1 group-hover:text-primary transition-colors duration-200">
              {{ category.name }}
            </h3>
            <p class="text-sm text-neutral-500">{{ category.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Featured Products-->
    <section class="py-20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <h2 class="text-3xl md:text-4xl font-bold text-neutral-900 mb-3">Featured Products</h2>
          <p class="text-lg text-neutral-600 max-w-2xl mx-auto">Handpicked for you. The best of the best.</p>
        </div>

        <div v-if="productsStore.loading" class="flex justify-center">
          <span>Loading...</span>
        </div>

        <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          <ProductCard v-for="product in featuredPreview" :key="product.id" :product="product" />
        </div>
        <div class="mt-8 text-center">
          <button @click="handleShopNow"
            class="inline-block bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition duration-300">
           View More Products
          </button>
        </div>

      </div>
    </section>

    <!-- Why Choose Us Section -->
    <section class="py-16 bg-gray-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Why Choose ElectroShop?</h2>
          <p class="text-lg text-gray-600 max-w-2xl mx-auto">
            We're committed to providing the best shopping experience with quality products
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="text-center p-6">
            <div class="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
              <svg class="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1">
                </path>
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-2">Best Prices</h3>
            <p class="text-gray-600">Competitive prices on all our products with regular discounts and offers</p>
          </div>

          <div class="text-center p-6">
            <div class="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
              <svg class="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-2">Fast Shipping</h3>
            <p class="text-gray-600">Quick and reliable delivery to your doorstep with tracking information</p>
          </div>

          <div class="text-center p-6">
            <div class="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
              <svg class="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-2">Quality Guarantee</h3>
            <p class="text-gray-600">All products come with manufacturer warranty and our quality assurance</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>