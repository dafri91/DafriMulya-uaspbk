<script setup>
import { onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { useProductsStore } from "../store/products";
import { useOrdersStore } from "../store/orders";
import { useAuthStore } from "../store/auth";

const router = useRouter();
const productsStore = useProductsStore();
const ordersStore = useOrdersStore();
const authStore = useAuthStore();

const totalProducts = computed(() => productsStore.products.length);
const totalOrders = computed(() => ordersStore.orders.length);
const totalRevenue = computed(() => {
  return ordersStore.orders.reduce((total, order) => total + (order.total || 0), 0);
});
const recentOrders = computed(() => {
  return [...ordersStore.orders]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);
});

const formatPrice = (price) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price || 0);
};

const formatDate = (dateString) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

onMounted(async () => {
  try {
    await authStore.fetchUser();
    console.log("Fetched user:", authStore.user);

    if (!authStore.isAdmin) {
      console.warn("User is not admin. Redirecting...");
      router.push("/");
      return;
    }

    console.log("Admin verified. Fetching data...");

    await Promise.all([
      ordersStore.fetchOrders(),
      productsStore.fetchProducts()
    ]);

    console.log("Fetched orders:", ordersStore.orders);
    console.log("Fetched products:", productsStore.products);

    if (ordersStore.orders.length === 0) {
      console.warn("Orders kosong. Cek rules Firebase. Mungkin Permission Denied.");
    }

  } catch (error) {
    console.error("Error di AdminDashboard:", error.message || error);
    if (error.message?.includes("Permission denied")) {
      console.error("Permission denied, Periksa rules Firebase.");
    }
  }
});
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <h1 class="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

    <!-- Loading state -->
    <div v-if="authStore.loading || ordersStore.loading" class="text-center py-8">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      <p class="mt-2 text-gray-600">Loading...</p>
    </div>

    <!-- Error state -->
    <div v-else-if="authStore.error || ordersStore.error" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
      <p class="text-red-800">{{ authStore.error || ordersStore.error }}</p>
    </div>

    <!-- Dashboard content -->
    <div v-else>
      <!-- Stats Grid -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <!-- Total Products -->
        <div class="bg-white rounded-lg shadow-sm p-6 border">
          <div class="flex items-center">
            <div class="p-2 bg-blue-100 rounded-lg">
              <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Total Products</p>
              <p class="text-2xl font-bold text-gray-900">{{ totalProducts }}</p>
            </div>
          </div>
        </div>

        <!-- Total Orders -->
        <div class="bg-white rounded-lg shadow-sm p-6 border">
          <div class="flex items-center">
            <div class="p-2 bg-green-100 rounded-lg">
              <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Total Orders</p>
              <p class="text-2xl font-bold text-gray-900">{{ totalOrders }}</p>
            </div>
          </div>
        </div>

        <!-- Total Revenue -->
        <div class="bg-white rounded-lg shadow-sm p-6 border">
          <div class="flex items-center">
            <div class="p-2 bg-yellow-100 rounded-lg">
              <svg class="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1">
                </path>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Total Revenue</p>
              <p class="text-2xl font-bold text-gray-900">
                {{ formatPrice(totalRevenue) }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Debug info (remove in production) -->
      <div class="bg-gray-50 rounded-lg p-4 mb-8 text-sm">
        <h4 class="font-semibold mb-2">Debug Info:</h4>
        <p>User role: {{ authStore.user?.role }}</p>
        <p>Is Admin: {{ authStore.isAdmin }}</p>
        <p>Orders count: {{ ordersStore.orders.length }}</p>
        <p>Products count: {{ productsStore.products.length }}</p>
      </div>

      <!-- Quick Actions -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div class="bg-white rounded-lg shadow-sm p-6 border">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Product Management</h3>
          <p class="text-gray-600 mb-4">Add, edit, or remove products from your inventory</p>
          <router-link to="/admin/products"
            class="bg-primary text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary/90 transition duration-150">
            Manage Products
          </router-link>
        </div>

        <div class="bg-white rounded-lg shadow-sm p-6 border">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Order Management</h3>
          <p class="text-gray-600 mb-4">View and manage customer orders and their status</p>
          <router-link to="/admin/orders"
            class="bg-accent text-white px-4 py-2 rounded-lg font-semibold hover:bg-accent/90 transition duration-150">
            View Orders
          </router-link>
        </div>
      </div>

      <!-- Recent Orders -->
      <div class="bg-white rounded-lg shadow-sm border">
        <div class="p-6 border-b">
          <h3 class="text-lg font-semibold text-gray-900">Recent Orders</h3>
        </div>

        <div v-if="recentOrders.length === 0" class="p-6 text-center text-gray-500">
          No orders yet
        </div>

        <div v-else class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="order in recentOrders" :key="order.id">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{{ order.id }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ formatDate(order.createdAt) }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ order.shippingName }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ formatPrice(order.total) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 capitalize">
                    {{ order.status }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>