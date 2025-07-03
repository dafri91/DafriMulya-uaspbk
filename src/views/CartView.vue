<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '../store/cart'
import CartItem from '../components/CartItem.vue'

const router = useRouter()
const cartStore = useCartStore()

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
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <h1 class="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

    <!-- Empty Cart -->
    <div v-if="isEmpty" class="text-center py-12">
      <svg class="mx-auto h-24 w-24 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 9M7 13v8a2 2 0 002 2h6a2 2 0 002-2v-8m-8 0V9a2 2 0 012-2h4a2 2 0 012 2v4.01" />
      </svg>
      <h2 class="text-2xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
      <p class="text-gray-600 mb-8">Add some products to get started!</p>
      <button
        @click="continueShopping"
        class="bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition duration-150"
      >
        Continue Shopping
      </button>
    </div>

    <!-- Cart with Items -->
    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Cart Items -->
      <div class="lg:col-span-2">
        <div class="space-y-4">
          <CartItem
            v-for="item in cartStore.items"
            :key="item.id"
            :item="item"
          />
        </div>
      </div>

      <!-- Order Summary -->
      <div class="lg:col-span-1">
        <div class="bg-gray-50 rounded-lg p-6 sticky top-24">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
          
          <div class="space-y-3 mb-6">
            <div class="flex justify-between">
              <span class="text-gray-600">Items ({{ cartStore.itemCount }})</span>
              <span class="font-medium">{{ formatPrice(totalPrice) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Shipping</span>
              <span class="font-medium text-green-600">Free</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Tax</span>
              <span class="font-medium">{{ formatPrice(totalPrice * 0.08) }}</span>
            </div>
            <div class="border-t pt-3">
              <div class="flex justify-between">
                <span class="text-lg font-semibold text-gray-900">Total</span>
                <span class="text-lg font-semibold text-gray-900">
                  {{ formatPrice(totalPrice + (totalPrice * 0.08)) }}
                </span>
              </div>
            </div>
          </div>

          <button
            @click="proceedToCheckout"
            class="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary/90 transition duration-150 mb-4"
          >
            Proceed to Checkout
          </button>

          <button
            @click="continueShopping"
            class="w-full bg-white text-primary border border-primary py-3 rounded-lg font-semibold hover:bg-primary/5 transition duration-150"
          >
            Continue Shopping
          </button>

          <!-- Security Badge -->
          <div class="mt-6 text-center">
            <div class="flex items-center justify-center text-sm text-gray-600">
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
              </svg>
              Secure Checkout
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>