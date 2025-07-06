<script setup>
import { useCartStore } from "../store/cart";
import { useRouter } from "vue-router";

const router = useRouter();

const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
});

const cartStore = useCartStore();

const updateQuantity = (newQuantity) => {
  if (newQuantity > 0) {
    cartStore.updateQuantity(props.item.id, newQuantity);
  }
};

const removeItem = () => {
  cartStore.removeFromCart(props.item.id);
};

const formatPrice = (price) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);
};

const goToProductDetail = () => {
  router.push(`/products/${props.item.product.id}`);
};
</script>

<template>
  <div class="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
    <div class="flex-grow flex items-center space-x-4 w-full">
      <img
        :src="item.product.image"
        :alt="item.product.name"
        @click="goToProductDetail"
        class="w-24 h-24 object-cover rounded-md flex-shrink-0"
      />
      <div class="flex-1 min-w-0">
        <h3 class="font-semibold text-slate-800 line-clamp-2">{{ item.product.name }}</h3>
        <p class="text-sm text-slate-500">{{ item.product.brand }}</p>
        <p class="text-md font-medium text-primary mt-1 md:hidden">
          {{ formatPrice(item.product.price) }}
        </p>
      </div>
    </div>

    <div class="hidden md:block w-32 text-center">
      <p class="text-md font-medium text-slate-600">
        {{ formatPrice(item.product.price) }}
      </p>
    </div>

    <div class="w-full md:w-auto flex justify-between items-center">
      <div class="flex items-center border border-slate-200 rounded-md">
        <button
          @click="updateQuantity(item.quantity - 1)"
          :disabled="item.quantity <= 1"
          class="w-9 h-9 flex items-center justify-center text-slate-500 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition rounded-l-md"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M20 12H4"
            ></path>
          </svg>
        </button>

        <span
          class="w-12 text-center font-semibold text-slate-800 text-md border-x border-slate-200"
          >{{ item.quantity }}</span
        >

        <button
          @click="updateQuantity(item.quantity + 1)"
          class="w-9 h-9 flex items-center justify-center text-slate-500 hover:bg-slate-100 transition rounded-r-md"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 6v12M6 12h12"
            ></path>
          </svg>
        </button>
      </div>

      <div class="md:hidden">
        <p class="font-semibold text-slate-800 text-lg text-right">
          {{ formatPrice(item.product.price * item.quantity) }}
        </p>
      </div>
    </div>

    <div class="hidden md:block w-32 text-right">
      <p class="font-semibold text-slate-800 text-lg">
        {{ formatPrice(item.product.price * item.quantity) }}
      </p>
    </div>

    <div class="w-full md:w-auto text-right">
      <button
        @click="removeItem"
        class="text-slate-400 hover:text-red-500 transition duration-150 p-2 -mr-2"
        title="Remove item"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
      </button>
    </div>
  </div>
</template>
