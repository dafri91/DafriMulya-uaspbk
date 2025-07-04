<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '../store/cart'
import { useOrdersStore } from '../store/orders'
import { useAuthStore } from '../store/auth'

const router = useRouter()
const cartStore = useCartStore()
const ordersStore = useOrdersStore()
const authStore = useAuthStore()

const loading = ref(false)
const orderForm = ref({
  firstName: '',
  lastName: '',
  email: authStore.user?.email || '',
  phone: '',
  address: '',
  city: '',
  state: '',
  zipCode: '',
  paymentMethod: 'credit_card'
})

const totalPrice = computed(() => cartStore.totalPrice)
const tax = computed(() => totalPrice.value * 0.08)
const finalTotal = computed(() => totalPrice.value + tax.value)

const formatPrice = (price) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(price)
}

const submitOrder = async () => {
  if (!authStore.isAuthenticated) {
    router.push('/login')
    return
  }

  if (cartStore.isEmpty) {
    router.push('/cart')
    return
  }

  loading.value = true

  const orderData = {
    shippingAddress: {
      firstName: orderForm.value.firstName,
      lastName: orderForm.value.lastName,
      email: orderForm.value.email,
      phone: orderForm.value.phone,
      address: orderForm.value.address,
      city: orderForm.value.city,
      state: orderForm.value.state,
      zipCode: orderForm.value.zipCode
    },
    paymentMethod: orderForm.value.paymentMethod,
    items: cartStore.items, //  Tambahkan ini
    total: finalTotal.value  //  Tambahkan ini
  }

  try {
    const result = await ordersStore.createOrder(orderData)
    if (result.success) {
      cartStore.clearCart() //  opsional, bersihkan cart setelah order
      router.push('/orders')
    } else {
      console.error('Order failed:', result.error)
    }
  } catch (error) {
    console.error('Order failed:', error)
  } finally {
    loading.value = false
  }
}

</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <h1 class="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

    <!-- Auth Check -->
    <div v-if="!authStore.isAuthenticated" class="text-center py-12">
      <h2 class="text-2xl font-semibold text-gray-900 mb-2">Login Required</h2>
      <p class="text-gray-600 mb-8">Please login to complete your order</p>
      <router-link
        to="/login"
        class="bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition duration-150"
      >
        Login
      </router-link>
    </div>

    <!-- Empty Cart Check -->
    <div v-else-if="cartStore.isEmpty" class="text-center py-12">
      <h2 class="text-2xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
      <p class="text-gray-600 mb-8">Add some items to your cart first</p>
      <router-link
        to="/products"
        class="bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition duration-150"
      >
        Browse Products
      </router-link>
    </div>

    <!-- Checkout Form -->
    <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-12">
      <!-- Shipping Information -->
      <div>
        <h2 class="text-xl font-semibold text-gray-900 mb-6">Shipping Information</h2>
        
        <form @submit.prevent="submitOrder" class="space-y-6">
          <!-- Name Fields -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label for="firstName" class="block text-sm font-medium text-gray-700 mb-2">
                First Name *
              </label>
              <input
                id="firstName"
                v-model="orderForm.firstName"
                type="text"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
            </div>
            <div>
              <label for="lastName" class="block text-sm font-medium text-gray-700 mb-2">
                Last Name *
              </label>
              <input
                id="lastName"
                v-model="orderForm.lastName"
                type="text"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
            </div>
          </div>

          <!-- Contact Fields -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                id="email"
                v-model="orderForm.email"
                type="email"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
            </div>
            <div>
              <label for="phone" class="block text-sm font-medium text-gray-700 mb-2">
                Phone *
              </label>
              <input
                id="phone"
                v-model="orderForm.phone"
                type="tel"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
            </div>
          </div>

          <!-- Address -->
          <div>
            <label for="address" class="block text-sm font-medium text-gray-700 mb-2">
              Address *
            </label>
            <input
              id="address"
              v-model="orderForm.address"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
          </div>

          <!-- City, State, Zip -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label for="city" class="block text-sm font-medium text-gray-700 mb-2">
                City *
              </label>
              <input
                id="city"
                v-model="orderForm.city"
                type="text"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
            </div>
            <div>
              <label for="state" class="block text-sm font-medium text-gray-700 mb-2">
                State *
              </label>
              <input
                id="state"
                v-model="orderForm.state"
                type="text"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
            </div>
            <div>
              <label for="zipCode" class="block text-sm font-medium text-gray-700 mb-2">
                Zip Code *
              </label>
              <input
                id="zipCode"
                v-model="orderForm.zipCode"
                type="text"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
            </div>
          </div>

          <!-- Payment Method -->
          <div>
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Payment Method</h3>
            <div class="space-y-3">
              <label class="flex items-center">
                <input
                  v-model="orderForm.paymentMethod"
                  type="radio"
                  value="credit_card"
                  class="form-radio h-4 w-4 text-primary"
                >
                <span class="ml-2">Credit Card</span>
              </label>
              <label class="flex items-center">
                <input
                  v-model="orderForm.paymentMethod"
                  type="radio"
                  value="paypal"
                  class="form-radio h-4 w-4 text-primary"
                >
                <span class="ml-2">PayPal</span>
              </label>
              <label class="flex items-center">
                <input
                  v-model="orderForm.paymentMethod"
                  type="radio"
                  value="apple_pay"
                  class="form-radio h-4 w-4 text-primary"
                >
                <span class="ml-2">Apple Pay</span>
              </label>
            </div>
          </div>
        </form>
      </div>

      <!-- Order Summary -->
      <div>
        <div class="bg-gray-50 rounded-lg p-6 sticky top-24">
          <h2 class="text-xl font-semibold text-gray-900 mb-6">Order Summary</h2>
          
          <!-- Items -->
          <div class="space-y-4 mb-6">
            <div
              v-for="item in cartStore.items"
              :key="item.id"
              class="flex items-center space-x-3"
            >
              <img
                :src="item.image"
                :alt="item.name"
                class="w-16 h-16 object-cover rounded-lg"
              >
              <div class="flex-1">
                <h4 class="font-medium text-gray-900">{{ item.name }}</h4>
                <p class="text-sm text-gray-600">Qty: {{ item.quantity }}</p>
              </div>
              <span class="font-medium">{{ formatPrice(item.price * item.quantity) }}</span>
            </div>
          </div>

          <!-- Totals -->
          <div class="space-y-3 border-t pt-6">
            <div class="flex justify-between">
              <span class="text-gray-600">Subtotal</span>
              <span class="font-medium">{{ formatPrice(totalPrice) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Shipping</span>
              <span class="font-medium text-green-600">Free</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Tax</span>
              <span class="font-medium">{{ formatPrice(tax) }}</span>
            </div>
            <div class="flex justify-between border-t pt-3">
              <span class="text-lg font-semibold text-gray-900">Total</span>
              <span class="text-lg font-semibold text-gray-900">{{ formatPrice(finalTotal) }}</span>
            </div>
          </div>

          <!-- Place Order Button -->
          <button
            @click="submitOrder"
            :disabled="loading"
            class="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition duration-150 mt-6"
          >
            <span v-if="loading">Processing...</span>
            <span v-else>Place Order - {{ formatPrice(finalTotal) }}</span>
          </button>

          <!-- Security Info -->
          <div class="mt-4 text-center text-sm text-gray-600">
            <div class="flex items-center justify-center">
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
              </svg>
              Your payment information is secure
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>