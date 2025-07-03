<script setup>
import { onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useOrdersStore } from '../store/orders'
import { useAuthStore } from '../store/auth'

const router = useRouter()
const ordersStore = useOrdersStore()
const authStore = useAuthStore()

const userOrders = computed(() => ordersStore.userOrders)

onMounted(async () => {
  if (!authStore.isAuthenticated) {
    router.push('/login')
    return
  }
  
  await ordersStore.fetchOrders()
})

const formatPrice = (price) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(price)
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const getStatusColor = (status) => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800'
    case 'processing':
      return 'bg-blue-100 text-blue-800'
    case 'shipped':
      return 'bg-purple-100 text-purple-800'
    case 'delivered':
      return 'bg-green-100 text-green-800'
    case 'cancelled':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <h1 class="text-3xl font-bold text-gray-900 mb-8">My Orders</h1>

    <!-- Auth Check -->
    <div v-if="!authStore.isAuthenticated" class="text-center py-12">
      <h2 class="text-2xl font-semibold text-gray-900 mb-2">Login Required</h2>
      <p class="text-gray-600 mb-8">Please login to view your orders</p>
      <router-link
        to="/login"
        class="bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition duration-150"
      >
        Login
      </router-link>
    </div>

    <!-- Loading State -->
    <div v-else-if="ordersStore.loading" class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>

    <!-- No Orders -->
    <div v-else-if="userOrders.length === 0" class="text-center py-12">
      <svg class="mx-auto h-24 w-24 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
      <h2 class="text-2xl font-semibold text-gray-900 mb-2">No orders yet</h2>
      <p class="text-gray-600 mb-8">Start shopping to see your orders here</p>
      <router-link
        to="/products"
        class="bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition duration-150"
      >
        Browse Products
      </router-link>
    </div>

    <!-- Orders List -->
    <div v-else class="space-y-6">
      <div
        v-for="order in userOrders"
        :key="order.id"
        class="bg-white border rounded-lg p-6 shadow-sm"
      >
        <!-- Order Header -->
        <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
          <div>
            <h3 class="text-lg font-semibold text-gray-900">Order #{{ order.id }}</h3>
            <p class="text-gray-600">Placed on {{ formatDate(order.createdAt) }}</p>
          </div>
          <div class="mt-4 lg:mt-0 flex items-center space-x-4">
            <span :class="['px-3 py-1 rounded-full text-sm font-medium capitalize', getStatusColor(order.status)]">
              {{ order.status }}
            </span>
            <span class="text-lg font-bold text-gray-900">{{ formatPrice(order.total) }}</span>
          </div>
        </div>

        <!-- Order Items -->
        <div class="space-y-4 mb-6">
          <div
            v-for="item in order.items"
            :key="item.id"
            class="flex items-center space-x-4"
          >
            <img
              :src="item.image"
              :alt="item.name"
              class="w-16 h-16 object-cover rounded-lg"
            >
            <div class="flex-1">
              <h4 class="font-medium text-gray-900">{{ item.name }}</h4>
              <p class="text-sm text-gray-600">{{ item.brand }}</p>
              <p class="text-sm text-gray-600">Qty: {{ item.quantity }}</p>
            </div>
            <span class="font-medium">{{ formatPrice(item.price * item.quantity) }}</span>
          </div>
        </div>

        <!-- Order Details -->
        <div class="border-t pt-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Shipping Address -->
            <div>
              <h4 class="font-medium text-gray-900 mb-2">Shipping Address</h4>
              <div class="text-sm text-gray-600">
                <p>{{ order.shippingAddress.firstName }} {{ order.shippingAddress.lastName }}</p>
                <p>{{ order.shippingAddress.address }}</p>
                <p>{{ order.shippingAddress.city }}, {{ order.shippingAddress.state }} {{ order.shippingAddress.zipCode }}</p>
              </div>
            </div>

            <!-- Order Info -->
            <div>
              <h4 class="font-medium text-gray-900 mb-2">Order Information</h4>
              <div class="text-sm text-gray-600 space-y-1">
                <p>Payment: {{ order.paymentMethod.replace('_', ' ').toUpperCase() }}</p>
                <p v-if="order.estimatedDelivery">
                  Estimated Delivery: {{ formatDate(order.estimatedDelivery) }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>