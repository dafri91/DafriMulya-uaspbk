<script setup>
import { useCartStore } from '../store/cart'

const props = defineProps({
  item: {
    type: Object,
    required: true
  }
})

const cartStore = useCartStore()

const updateQuantity = (newQuantity) => {
  if (newQuantity > 0) {
    cartStore.updateQuantity(props.item.id, newQuantity)
  }
}

const removeItem = () => {
  cartStore.removeFromCart(props.item.id)
}

const formatPrice = (price) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(price)
}
</script>

<template>
  <div class="flex items-center space-x-4 p-4 bg-white rounded-lg shadow-sm border">
    <!-- Product Image -->
    <img
      :src="item.image"
      :alt="item.name"
      class="w-20 h-20 object-cover rounded-lg"
    >
    
    <!-- Product Info -->
    <div class="flex-1">
      <h3 class="font-semibold text-gray-900">{{ item.name }}</h3>
      <p class="text-sm text-gray-600">{{ item.brand }}</p>
      <p class="text-lg font-bold text-primary">{{ formatPrice(item.price) }}</p>
    </div>
    
    <!-- Quantity Controls -->
    <div class="flex items-center space-x-2">
      <button
        @click="updateQuantity(item.quantity - 1)"
        :disabled="item.quantity <= 1"
        class="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition duration-150"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"></path>
        </svg>
      </button>
      
      <span class="w-12 text-center font-semibold">{{ item.quantity }}</span>
      
      <button
        @click="updateQuantity(item.quantity + 1)"
        class="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition duration-150"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
        </svg>
      </button>
    </div>
    
    <!-- Total Price -->
    <div class="text-right">
      <p class="font-bold text-lg">{{ formatPrice(item.price * item.quantity) }}</p>
    </div>
    
    <!-- Remove Button -->
    <button
      @click="removeItem"
      class="text-red-500 hover:text-red-700 p-2 transition duration-150"
      title="Remove item"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
      </svg>
    </button>
  </div>
</template>
