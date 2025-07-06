<script setup>
import { onMounted, watch } from "vue";
import { useAuthStore } from "./store/auth";
import { useCartStore } from "./store/cart";
import { useFavoritesStore } from "./store/favorites";
import Navbar from "./components/Navbar.vue";
import Footer from "./components/Footer.vue";

const authStore = useAuthStore();
const cartStore = useCartStore();
const favoritesStore = useFavoritesStore();

onMounted(async () => {
  authStore.loadFromLocal();

  favoritesStore.loadFromLocalStorage();

  if (authStore.isAuthenticated && !authStore.isAdmin) {
    await favoritesStore.fetchFavorites();
    await cartStore.fetchCart();
  }
});

//  Watch login/logout
watch(
  () => authStore.isAuthenticated,
  async (isLoggedIn) => {
    if (isLoggedIn && !authStore.isAdmin) {
      await favoritesStore.fetchFavorites();
      await cartStore.fetchCart();
    } else {
      favoritesStore.clearFavorites();
      cartStore.clearLocalCart();
    }
  },
  { immediate: true }
);
</script>

<template>
  <div id="app" class="min-h-screen bg-gray-50 font-inter">
    <Navbar />
    <main class="min-h-screen">
      <router-view />
    </main>
    <Footer />
  </div>
</template>

<style>
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap");

body {
  font-family: "Inter", sans-serif;
}

.form-radio {
  appearance: none;
  border: 1px solid #d1d5db;
  border-radius: 50%;
  width: 1rem;
  height: 1rem;
  background-color: white;
  position: relative;
}

.form-radio:checked {
  background-color: #1e3a8a;
  border-color: #1e3a8a;
}

.form-radio:checked::after {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 0.375rem;
  height: 0.375rem;
  border-radius: 50%;
  background-color: white;
}

.form-checkbox {
  appearance: none;
  border: 1px solid #d1d5db;
  border-radius: 0.25rem;
  width: 1rem;
  height: 1rem;
  background-color: white;
  position: relative;
}

.form-checkbox:checked {
  background-color: #1e3a8a;
  border-color: #1e3a8a;
}

.form-checkbox:checked::after {
  content: "";
  position: absolute;
  top: 0.125rem;
  left: 0.25rem;
  width: 0.25rem;
  height: 0.5rem;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
