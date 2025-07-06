<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useProductsStore } from "../store/products";
import { useCartStore } from "../store/cart";
import { useAuthStore } from "../store/auth";
import ProductCard from "../components/ProductCard.vue";
import FavoriteButton from "../components/FavoriteButton.vue";
import { db } from "../firebase";
import { ref as dbRef, get, child } from "firebase/database";

const authStore = useAuthStore();
const route = useRoute();
const router = useRouter();
const productsStore = useProductsStore();
const cartStore = useCartStore();

const selectedImage = ref(0);
const quantity = ref(1);
const reviews = ref([]);
const loading = ref(true);

const averageRating = computed(() => {
  if (!reviews.value.length) return 0;
  const total = reviews.value.reduce((acc, r) => acc + r.rating, 0);
  return (total / reviews.value.length).toFixed(1);
});

const product = computed(() => productsStore.currentProduct);
const recommendations = computed(() => {
  if (!product.value) return [];
  return productsStore.getRecommendations(product.value.id);
});

const formatPrice = (price) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);
};

const addToCart = async () => {
  if (!authStore.isAuthenticated) {
    alert("Please login to add items to cart.");
    router.push("/login");
    return;
  }

  if (authStore.isAdmin) {
    alert("Admin tidak diperbolehkan menambahkan produk ke keranjang.");
    return;
  }

  if (product.value) {
    await cartStore.addToCart(product.value, quantity.value);
  }
};

const fetchReviews = async (productId) => {
  try {
    const snapshot = await get(child(dbRef(db), "reviews"));
    if (snapshot.exists()) {
      const data = snapshot.val();
      reviews.value = Object.entries(data)
        .filter(([_, val]) => val.productId === Number(productId))
        .map(([id, val]) => ({ id, ...val }));
    } else {
      reviews.value = [];
    }
  } catch (error) {
    console.error("Error fetching reviews from Firebase:", error);
    reviews.value = [];
  }
};

const loadProductDetail = async (id) => {
  loading.value = true;
  selectedImage.value = 0;
  quantity.value = 1;
  if (!productsStore.products.length) {
    await productsStore.fetchProducts();
  }
  await productsStore.fetchProduct(id);
  await fetchReviews(id);
  loading.value = false;
};

onMounted(() => {
  loadProductDetail(route.params.id);
});

watch(
  () => route.params.id,
  (newId) => {
    loadProductDetail(newId);
  }
);

const incrementQuantity = () => {
  quantity.value++;
};

const decrementQuantity = () => {
  if (quantity.value > 1) {
    quantity.value--;
  }
};
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div v-if="loading" class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>

    <div v-else-if="!product" class="text-center py-12">
      <h2 class="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h2>
      <button @click="router.push('/products')" class="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90">
        Back to Products
      </button>
    </div>

    <div v-else>
      <nav class="flex mb-8" aria-label="Breadcrumb">
        <ol class="inline-flex items-center space-x-1 md:space-x-3">
          <li>
            <router-link to="/" class="text-gray-500 hover:text-primary">Home</router-link>
          </li>
          <li>
            <span class="text-gray-400 mx-2">/</span><router-link to="/products"
              class="text-gray-500 hover:text-primary">Products</router-link>
          </li>
          <li>
            <span class="text-gray-400 mx-2">/</span><span class="text-gray-900">{{ product.name }}</span>
          </li>
        </ol>
      </nav>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div>
          <div class="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
            <img :src="product.images ? product.images[selectedImage] : product.image" :alt="product.name"
              class="w-full h-full object-cover" />
          </div>

          <div v-if="product.images && product.images.length > 1" class="flex space-x-2">
            <button v-for="(image, index) in product.images" :key="index" @click="selectedImage = index" :class="[
              'w-20 h-20 rounded-lg overflow-hidden border-2',
              selectedImage === index
                ? 'border-primary'
                : 'border-gray-200 hover:border-gray-300',
            ]">
              <img :src="image" class="w-full h-full object-cover" />
            </button>
          </div>
        </div>

        <div>
          <div class="mb-4">
            <p class="text-sm text-gray-600 mb-1">{{ product.brand }}</p>
            <h1 class="text-3xl font-bold text-gray-900">{{ product.name }}</h1>
          </div>

          <div class="flex items-center mb-6">
            <div class="flex items-center">
              <svg v-for="star in 5" :key="star" :class="[
                'w-5 h-5',
                star <= Math.floor(product.rating)
                  ? 'text-yellow-400'
                  : 'text-gray-300',
              ]" fill="currentColor" viewBox="0 0 20 20">
                <path
                  d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
            <span class="ml-2 text-gray-600">
              {{ averageRating }} ({{ reviews.length }} reviews)
            </span>
          </div>

          <div class="mb-6">
            <div class="flex items-center space-x-3">
              <span class="text-3xl font-bold text-gray-900">{{
                formatPrice(product.price)
                }}</span>
              <span v-if="product.originalPrice && product.originalPrice > product.price"
                class="text-xl text-gray-500 line-through">{{ formatPrice(product.originalPrice) }}</span>
            </div>
          </div>

          <div class="mb-6">
            <p class="text-gray-700 leading-relaxed">
              {{ product.description }}
            </p>
          </div>

          <div v-if="product.specifications" class="mb-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-3">Specifications</h3>
            <div class="bg-gray-50 rounded-lg p-4">
              <dl class="grid grid-cols-1 gap-3">
                <div v-for="(value, key) in product.specifications" :key="key" class="flex justify-between">
                  <dt class="font-medium text-gray-900 capitalize">
                    {{ key.replace("_", " ") }}:
                  </dt>
                  <dd class="text-gray-700">{{ value }}</dd>
                </div>
              </dl>
            </div>
          </div>

          <div class="mb-6">
            <div class="flex items-center space-x-4 mb-4">
              <div class="flex items-center space-x-2">
                <label class="text-sm font-medium text-gray-900">Quantity:</label>
                <div class="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                  <button @click="decrementQuantity" class="px-3 py-2 text-gray-700 hover:bg-gray-100">
                    −
                  </button>
                  <span class="px-4 py-2 border-l border-r">{{ quantity }}</span>
                  <button @click="incrementQuantity" class="px-3 py-2 text-gray-700 hover:bg-gray-100">
                    +
                  </button>
                </div>
              </div>

              <div class="flex items-center">
                <div :class="[
                  'w-3 h-3 rounded-full mr-2',
                  product.inStock ? 'bg-green-500' : 'bg-red-500',
                ]"></div>
                <span :class="product.inStock ? 'text-green-600' : 'text-red-600'">
                  {{ product.inStock ? "In Stock" : "Out of Stock" }}
                </span>
              </div>
            </div>

            <div class="flex space-x-4">
              <button v-if="!authStore.isAdmin" @click="addToCart" :disabled="!product.inStock"
                class="flex-1 bg-primary text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary/90 disabled:opacity-50">
                Add to Cart
              </button>

              <FavoriteButton :product="product" />
            </div>
          </div>
        </div>
      </div>

      <!-- Reviews -->
      <div class="mt-16">
        <h2 class="text-2xl font-bold text-gray-900 mb-8">Customer Reviews</h2>

        <div v-if="reviews.length === 0" class="text-center py-8 text-gray-500">
          No reviews yet. Be the first to review this product!
        </div>

        <div v-else class="space-y-6">
          <div v-for="review in reviews" :key="review.id" class="bg-white border rounded-lg p-6">
            <div class="flex items-start justify-between">
              <div>
                <div class="flex items-center mb-2">
                  <div class="flex items-center">
                    <svg v-for="star in 5" :key="star" :class="[
                      'w-4 h-4',
                      star <= review.rating ? 'text-yellow-400' : 'text-gray-300',
                    ]" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                  <span class="ml-2 font-semibold text-gray-900">{{
                    review.userName
                    }}</span>
                </div>
                <p class="text-gray-700">{{ review.comment }}</p>
              </div>
              <span class="text-sm text-gray-500">{{
                new Date(review.createdAt).toLocaleDateString()
                }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Recommendations -->
      <div v-if="recommendations.length > 0" class="mt-16">
        <h2 class="text-2xl font-bold text-gray-900 mb-8">You might also like</h2>
        <div class="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <ProductCard v-for="recommendation in recommendations" :key="recommendation.id" :product="recommendation" />
        </div>
      </div>
    </div>
  </div>
</template>
