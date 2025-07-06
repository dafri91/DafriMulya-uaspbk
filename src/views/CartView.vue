<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '../store/cart'
import { useAuthStore } from '../store/auth'
import CartItem from '../components/CartItem.vue'

const router = useRouter()
const cartStore = useCartStore()
const authStore = useAuthStore()

const totalPrice = computed(() => cartStore.totalPrice)
const isEmpty = computed(() => cartStore.isEmpty)

const formatPrice = (price) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(price)
}

const proceedToCheckout = () => {
  router.push('/checkout')
}

const continueShopping = () => {
  router.push('/products')
}

// Penting: fetch cart saat halaman /cart dibuka
onMounted(() => {
  if (authStore.isAuthenticated && !authStore.isAdmin) {
    cartStore.fetchCart()
  }
})

const cartItems = computed(() => cartStore.cartItems)

</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <h1 class="text-3xl font-bold text-neutral-900 mb-10 text-left">Shopping Cart</h1>

    <!-- Empty Cart -->
    <div v-if="isEmpty" class="flex flex-col items-center justify-center py-24 bg-white rounded-lg shadow-sm border">
      <svg class="h-24 w-24 text-neutral-300 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 9M7 13v8a2 2 0 002 2h6a2 2 0 002-2v-8m-8 0V9a2 2 0 012-2h4a2 2 0 012 2v4.01" />
      </svg>
      <h2 class="text-2xl font-semibold text-neutral-800 mb-2">Your cart is empty</h2>
      <p class="text-neutral-500 mb-8">Add some products to get started!</p>
      <button @click="continueShopping"
        class="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-full font-semibold transition duration-200 shadow">
        Continue Shopping
      </button>
    </div>

    <!-- Cart with Items -->
    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-12">
      <!-- Cart Items -->
      <div class="lg:col-span-2 space-y-6">
        <CartItem v-for="item in cartItems" :key="item.id" :item="item" />
      </div>

      <!-- Order Summary -->
      <div class="bg-white rounded-2xl shadow-md border p-6 sticky top-24">
        <h2 class="text-xl font-semibold text-neutral-900 mb-6 border-b pb-3">Order Summary</h2>

        <div class="space-y-4 mb-6 text-sm">
          <div class="flex justify-between">
            <span class="text-neutral-600">Items ({{ cartStore.itemCount }})</span>
            <span class="font-medium">{{ formatPrice(totalPrice) }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-neutral-600">Shipping</span>
            <span class="font-medium text-green-600">Free</span>
          </div>
          <div class="flex justify-between">
            <span class="text-neutral-600">Tax (8%)</span>
            <span class="font-medium">{{ formatPrice(totalPrice * 0.08) }}</span>
          </div>
          <div class="border-t pt-3 flex justify-between font-semibold text-lg">
            <span class="text-neutral-900">Total</span>
            <span class="text-neutral-900">{{ formatPrice(totalPrice + (totalPrice * 0.08)) }}</span>
          </div>
        </div>

        <button @click="proceedToCheckout"
          class="w-full bg-primary text-white py-3 rounded-full font-semibold hover:bg-primary/90 transition duration-200 mb-3 shadow">
          Proceed to Checkout
        </button>

        <button @click="continueShopping"
          class="w-full bg-white text-primary border border-primary py-3 rounded-full font-semibold hover:bg-primary/5 transition duration-200 shadow-sm">
          Continue Shopping
        </button>

        <div class="mt-6 text-center text-sm text-neutral-400">
          <div class="flex items-center justify-center">
            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z">
              </path>
            </svg>
            Secure Checkout
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
