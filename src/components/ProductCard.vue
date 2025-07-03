<script setup>
import { computed } from "vue";
import { useRouter } from "vue-router";
import { useCartStore } from "../store/cart";
import FavoriteButton from "./FavoriteButton.vue";

const props = defineProps({
  product: { type: Object, required: true },
});

const router = useRouter();
const cartStore = useCartStore();

const discountPercentage = computed(() => {
  if (
    props.product.originalPrice &&
    props.product.originalPrice > props.product.price
  ) {
    return Math.round(
      ((props.product.originalPrice - props.product.price) /
        props.product.originalPrice) *
        100
    );
  }
  return 0;
});

const addToCart = (event) => {
  event.stopPropagation();
  cartStore.addToCart(props.product);
};

const viewProduct = () => {
  router.push(`/products/${props.product.id}`);
};

const formatPrice = (price) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);
};

const priceLengthClass = computed(() => {
  const formatted = formatPrice(props.product.price)
  return formatted.length > 14 ? 'text-sm' : 'text-base sm:text-lg'
})

</script>

<template>
  <div
    @click="viewProduct"
    class="bg-white rounded-xl shadow hover:shadow-lg transition-all duration-300 cursor-pointer group border border-neutral-100 flex flex-col"
  >
    <!-- IMAGE -->
    <div class="relative w-full overflow-hidden aspect-square">
      <img
        :src="product.image"
        :alt="product.name"
        class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
      />
      <div
        v-if="discountPercentage > 0"
        class="absolute top-3 left-3 bg-red-500 text-white px-2 py-0.5 rounded-full text-xs font-bold"
      >
        -{{ discountPercentage }}%
      </div>
      <div
        class="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
      >
        <FavoriteButton :product="product" />
      </div>
    </div>

    <!-- CONTENT -->
    <div class="flex-1 flex flex-col justify-between p-3 sm:p-4">
      <!-- Brand & Rating -->
      <div
        class="flex justify-between items-center text-xs text-neutral-500 mb-1"
      >
        <span class="truncate">{{ product.brand }}</span>
        <div class="flex items-center gap-1">
          <svg
            class="w-4 h-4 text-yellow-400"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
            />
          </svg>
          <span class="font-semibold">{{ product.rating }}</span>
          <span class="text-neutral-400">({{ product.reviews }})</span>
        </div>
      </div>

      <!-- Product Name -->
      <h3
        class="font-semibold text-neutral-800 text-sm sm:text-base mb-3 min-h-[3rem] line-clamp-2 group-hover:text-primary transition-colors duration-200"
      >
        {{ product.name }}
      </h3>

      <!-- Price & Add to Cart -->
<div class="flex flex-wrap items-center justify-between gap-2 mt-auto">
  <div class="flex flex-col min-w-0 truncate">
    <span :class="`${priceLengthClass.value} font-bold text-primary truncate`">
      {{ formatPrice(product.price) }}
    </span>
    <span
      v-if="discountPercentage > 0"
      class="text-xs text-neutral-400 line-through truncate"
    >
      {{ formatPrice(product.originalPrice) }}
    </span>
  </div>
  <button
    @click.stop="addToCart"
    class="bg-primary hover:bg-primary/90 text-white rounded-full p-2 transition duration-300"
    title="Tambah ke Keranjang"
  >
    <svg
      class="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.3 2.3c-.6.6-.2 1.7.7 1.7H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
      />
    </svg>
  </button>
</div>

    </div>
  </div>
</template>
