<script setup>
import { ref, computed, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "../store/auth";
import { useCartStore } from "../store/cart";
import { useFavoritesStore } from "../store/favorites";
import { useProductsStore } from "../store/products";
import FilterModal from "./FilterModal.vue";
import Swal from 'sweetalert2'


const router = useRouter();
const route = useRoute();

const authStore = useAuthStore();
const cartStore = useCartStore();
const favoritesStore = useFavoritesStore();
const productsStore = useProductsStore();

const isMenuOpen = ref(false);
const showMobileFilter = ref(false);
const searchQuery = ref(productsStore.searchQuery);

const cartItemCount = computed(() => cartStore.itemCount);
const favoriteCount = computed(() => favoritesStore.favoriteCount);

const isProductsPage = computed(() => route.name === "Products");

const handleSearch = () => {
  productsStore.setSearchQuery(searchQuery.value);
  if (router.currentRoute.value.name !== "Products") {
    router.push("/products");
  }
};



const showLogoutConfirm = ref(false);

const confirmLogout = () => {
  showLogoutConfirm.value = true;
};

const performLogout = () => {
  authStore.logout();
  favoritesStore.clearFavorites();
  router.push("/");
  showLogoutConfirm.value = false;
};



const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};

// LOCK BODY SCROLL saat salah satu modal/overlay terbuka
watch([isMenuOpen, showMobileFilter], ([menuVal, filterVal]) => {
  document.body.style.overflow = menuVal || filterVal ? "hidden" : "";
});

const handleClearFilters = () => {
  productsStore.clearFilters();
  showMobileFilter.value = false;
};

const isOrdersOrCartPage = computed(() => route.name === "Orders" || route.name === "Cart");
const showMobileCartIcon = computed(() =>
  authStore.isAuthenticated && !authStore.isAdmin && !isOrdersOrCartPage.value
);

</script>

<template>
  <nav class="bg-white/80 backdrop-blur-lg sticky top-0 z-50 border-b border-neutral-200">
    <div class="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8">
      <div class="flex justify-between items-center h-14 sm:h-16 md:h-20">
        <router-link to="/" class="flex-shrink-0 flex items-center pr-2 md:pr-4 lg:pr-6">
          <span class="text-2xl font-bold text-primary">ElectroShop</span>
        </router-link>

        <div class="hidden md:flex items-center md:space-x-4 lg:space-x-6 text-sm md:text-sm lg:text-base">
          <router-link to="/" class="text-neutral-600 hover:text-primary font-medium"
            active-class="text-primary">Home</router-link>
          <router-link to="/products" class="text-neutral-600 hover:text-primary font-medium"
            active-class="text-primary">Products</router-link>
        </div>

        <div class="hidden md:flex items-center flex-1 max-w-lg mx-4">
          <div class="relative w-full">
            <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg class="h-5 w-5 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input v-model="searchQuery" @keyup.enter="handleSearch" type="text"
              placeholder="Search products, brands, and more..."
              class="w-full bg-neutral-100 pl-12 pr-4 py-2 rounded-full focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-300" />
          </div>
        </div>

        <div class="hidden md:flex items-center space-x-4">
          <router-link v-if="authStore.isAuthenticated && !authStore.isAdmin" to="/favorites"
            class="relative text-neutral-600 hover:text-primary transition-colors duration-200">
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <span v-if="favoriteCount > 0"
              class="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">{{
                favoriteCount }}</span>
          </router-link>

          <router-link v-if="authStore.isAuthenticated && !authStore.isAdmin" to="/cart"
            class="relative text-neutral-600 hover:text-primary transition-colors duration-200">
            <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <span v-if="cartItemCount > 0"
              class="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">{{
                cartItemCount }}</span>
          </router-link>

          <div v-if="authStore.isAuthenticated" class="h-6 w-px bg-neutral-200"></div>

          <div v-if="authStore.isAuthenticated" class="relative group">
            <div class="p-2 rounded-full hover:bg-neutral-100 cursor-pointer">
              <svg class="w-6 h-6 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div
              class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 py-1 invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-200 transform origin-top-right">
              <div class="px-4 py-3 border-b">
                <p class="text-sm font-semibold text-gray-900">Signed in as</p>
                <p class="text-sm text-gray-600 truncate">
                  {{ authStore.user.email }}
                </p>
              </div>
              <div class="py-1">
                <router-link to="/profile"
                  class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Profile</router-link>
                <router-link v-if="!authStore.isAdmin" to="/orders"
                  class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Orders</router-link>
                <router-link v-if="authStore.isAdmin" to="/admin/dashboard"
                  class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Admin Dashboard</router-link>
              </div>
              <div class="py-1 border-t border-gray-100">
                <button @click="confirmLogout"
                  class="block w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50">
                  Logout
                </button>
              </div>
            </div>
          </div>

          <div v-else class="flex items-center space-x-2">
            <router-link to="/login"
              class="text-neutral-600 hover:bg-neutral-100 px-4 py-2 rounded-lg font-medium transition-colors duration-200">Login</router-link>
            <router-link to="/register"
              class="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors duration-200 font-medium">Register</router-link>
          </div>
        </div>

        <div class="flex items-center space-x-3 md:hidden">
          <!-- CART ICON: hanya muncul kalau login, bukan di orders -->
          <router-link v-if="showMobileCartIcon" to="/cart" class="relative text-neutral-700 hover:text-primary">
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <span v-if="cartItemCount > 0"
              class="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">{{
                cartItemCount }}</span>
          </router-link>

          <!-- FILTER ICON: hanya muncul di /products -->
          <button v-if="isProductsPage" @click="showMobileFilter = true" class="text-neutral-700 hover:text-primary">
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L15 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 019 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
            </svg>
          </button>

          <!-- BURGER MENU -->
          <button @click="toggleMenu" class="text-neutral-700 hover:text-primary">
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path v-if="!isMenuOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M4 6h16M4 12h16M4 18h16" />
              <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <div v-if="isMenuOpen" class="md:hidden">
      <div class="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-neutral-200">
        <div class="px-1 py-2">
          <div class="relative w-full">
            <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg class="h-5 w-5 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input v-model="searchQuery" @keyup.enter="
              handleSearch();
            toggleMenu();
            " type="text" placeholder="Search products..."
              class="w-full bg-neutral-100 pl-12 pr-4 py-2.5 rounded-full focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-300" />
          </div>
        </div>

        <router-link to="/" class="block px-3 py-2 text-neutral-700 hover:text-primary rounded-md"
          @click="toggleMenu">Home</router-link>
        <router-link to="/products" class="block px-3 py-2 text-neutral-700 hover:text-primary rounded-md"
          @click="toggleMenu">Products</router-link>

        <template v-if="authStore.isAuthenticated">
          <router-link v-if="!authStore.isAdmin" to="/favorites"
            class="flex items-center px-3 py-2 text-neutral-700 hover:text-primary rounded-md"
            @click="toggleMenu">Favorites<span v-if="favoriteCount > 0"
              class="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-1">{{ favoriteCount }}</span></router-link>
          <router-link to="/profile" class="block px-3 py-2 text-neutral-700 hover:text-primary rounded-md"
            @click="toggleMenu">Profile</router-link>
          <router-link v-if="!authStore.isAdmin" to="/orders"
            class="block px-3 py-2 text-neutral-700 hover:text-primary rounded-md"
            @click="toggleMenu">Orders</router-link>
          <router-link v-if="authStore.isAdmin" to="/admin/dashboard"
            class="block px-3 py-2 text-neutral-700 hover:text-primary rounded-md" @click="toggleMenu">Admin
            Dashboard</router-link>
          <button @click="
            confirmLogout();
          toggleMenu();
          " class="block w-full text-left px-3 py-2 text-neutral-700 hover:text-primary rounded-md">
            Logout
          </button>
        </template>
        <template v-else>
          <router-link to="/login" class="block px-3 py-2 text-neutral-700 hover:text-primary rounded-md"
            @click="toggleMenu">Login</router-link>
          <router-link to="/register" class="block px-3 py-2 text-neutral-700 hover:text-primary rounded-md"
            @click="toggleMenu">Register</router-link>
        </template>
      </div>
    </div>
  </nav>
  <!-- MODAL CONFIRM LOGOUT -->
  <transition name="fade">
    <div v-if="showLogoutConfirm"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm">
      <div class="bg-white rounded-lg shadow-xl p-6 w-80 text-center">
        <h2 class="text-lg font-bold mb-2">Logout</h2>
        <p class="text-neutral-600 mb-4">Are you sure you want to logout?</p>
        <div class="flex justify-center space-x-3">
          <button @click="showLogoutConfirm = false" class="px-4 py-2 rounded bg-neutral-200 hover:bg-neutral-300">
            Cancel
          </button>
          <button @click="performLogout" class="px-4 py-2 rounded bg-[#2563EB] text-white hover:bg-[#2563EB]">
            Logout
          </button>
        </div>
      </div>
    </div>
  </transition>


  <FilterModal v-if="isProductsPage" :show="showMobileFilter" :onClose="() => (showMobileFilter = false)"
    :productsStore="productsStore" :handleClearFilters="handleClearFilters" />
</template>
