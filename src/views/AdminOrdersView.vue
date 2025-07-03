<script setup>
import { onMounted, ref } from 'vue'
import { useOrdersStore } from '../store/orders'

const ordersStore = useOrdersStore()
const selectedOrder = ref(null)

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
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
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

const updateOrderStatus = async (orderId, newStatus) => {
  await ordersStore.updateOrderStatus(orderId, newStatus)
}

const viewOrder = (order) => {
  selectedOrder.value = order
}

const closeOrderDetail = () => {
  selectedOrder.value = null
}

onMounted(async () => {
  await ordersStore.fetchOrders()
})
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="flex items-center justify-between mb-8">
      <h1 class="text-3xl font-bold text-gray-900">Manage Orders</h1>
      <div class="text-sm text-gray-600">
        Total Orders: {{ ordersStore.orders.length }}
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="ordersStore.loading" class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>

    <!-- Orders Table -->
    <div v-else class="bg-white rounded-lg shadow-sm border overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="order in ordersStore.orders" :key="order.id">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                #{{ order.id }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatDate(order.createdAt) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ order.shippingAddress.firstName }} {{ order.shippingAddress.lastName }}
                <div class="text-xs text-gray-500">{{ order.shippingAddress.email }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {{ formatPrice(order.total) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <select
                  :value="order.status"
                  @change="updateOrderStatus(order.id, $event.target.value)"
                  :class="['px-2 py-1 rounded-full text-xs font-medium capitalize', getStatusColor(order.status)]"
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button
                  @click="viewOrder(order)"
                  class="text-primary hover:text-primary/80"
                >
                  View Details
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Order Detail Modal -->
    <div v-if="selectedOrder" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-semibold text-gray-900">Order Details #{{ selectedOrder.id }}</h2>
          <button @click="closeOrderDetail" class="text-gray-400 hover:text-gray-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <!-- Order Info -->
          <div>
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Order Information</h3>
            <div class="space-y-2 text-sm">
              <div><strong>Order ID:</strong> #{{ selectedOrder.id }}</div>
              <div><strong>Date:</strong> {{ formatDate(selectedOrder.createdAt) }}</div>
              <div><strong>Status:</strong> 
                <span :class="['px-2 py-1 rounded-full text-xs font-medium capitalize ml-2', getStatusColor(selectedOrder.status)]">
                  {{ selectedOrder.status }}
                </span>
              </div>
              <div><strong>Payment Method:</strong> {{ selectedOrder.paymentMethod.replace('_', ' ').toUpperCase() }}</div>
              <div><strong>Total:</strong> {{ formatPrice(selectedOrder.total) }}</div>
            </div>
          </div>

          <!-- Shipping Address -->
          <div>
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Shipping Address</h3>
            <div class="text-sm text-gray-600">
              <p>{{ selectedOrder.shippingAddress.firstName }} {{ selectedOrder.shippingAddress.lastName }}</p>
              <p>{{ selectedOrder.shippingAddress.email }}</p>
              <p>{{ selectedOrder.shippingAddress.phone }}</p>
              <p>{{ selectedOrder.shippingAddress.address }}</p>
              <p>{{ selectedOrder.shippingAddress.city }}, {{ selectedOrder.shippingAddress.state }} {{ selectedOrder.shippingAddress.zipCode }}</p>
            </div>
          </div>
        </div>

        <!-- Order Items -->
        <div>
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Order Items</h3>
          <div class="space-y-4">
            <div
              v-for="item in selectedOrder.items"
              :key="item.id"
              class="flex items-center space-x-4 p-4 border rounded-lg"
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
              <div class="text-right">
                <p class="font-medium">{{ formatPrice(item.price) }}</p>
                <p class="text-sm text-gray-600">Total: {{ formatPrice(item.price * item.quantity) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>