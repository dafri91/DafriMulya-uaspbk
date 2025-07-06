import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "../store/auth"; //  penting! untuk guard

// Lazy load all views for better performance
const HomeView = () => import("../views/HomeView.vue");
const ProductListView = () => import("../views/ProductListView.vue");
const ProductDetailView = () => import("../views/ProductDetailView.vue");
const CartView = () => import("../views/CartView.vue");
const FavoritesView = () => import("../views/FavoritesView.vue");
const CheckoutView = () => import("../views/CheckoutView.vue");
const OrdersView = () => import("../views/OrdersView.vue");
const ProfileView = () => import("../views/ProfileView.vue");
const LoginView = () => import("../views/LoginView.vue");
const RegisterView = () => import("../views/RegisterView.vue");

// Admin Views
const AdminLoginView = () => import("../views/AdminLoginView.vue");
const AdminDashboardView = () => import("../views/AdminDashboardView.vue");
const AdminProductsView = () => import("../views/AdminProductsView.vue");
const AdminOrdersView = () => import("../views/AdminOrdersView.vue");
// const AdminReviewsView = () => import("../views/AdminReviewsView.vue");

const routes = [
  { path: "/", name: "Home", component: HomeView },
  { path: "/login", name: "Login", component: LoginView },
  { path: "/register", name: "Register", component: RegisterView },
  { path: "/products", name: "Products", component: ProductListView },
  {
    path: "/products/:id",
    name: "ProductDetail",
    component: ProductDetailView,
    props: true,
  },

  //  User-only routes
  {
    path: "/cart",
    name: "Cart",
    component: CartView,
    meta: { requiresAuth: true, userOnly: true },
  },
  {
    path: "/checkout",
    name: "Checkout",
    component: CheckoutView,
    meta: { requiresAuth: true, userOnly: true },
  },
  {
    path: "/orders",
    name: "Orders",
    component: OrdersView,
    meta: { requiresAuth: true, userOnly: true },
  },
  {
    path: "/favorites",
    name: "Favorites",
    component: FavoritesView,
    meta: { requiresAuth: true },
  },
  {
    path: "/profile",
    name: "Profile",
    component: ProfileView,
    meta: { requiresAuth: true },
  },

  // Admin-only routes
  { path: "/admin/login", name: "AdminLogin", component: AdminLoginView },
  {
    path: "/admin/dashboard",
    name: "AdminDashboard",
    component: AdminDashboardView,
    meta: { requiresAdmin: true },
  },
  {
    path: "/admin/products",
    name: "AdminProducts",
    component: AdminProductsView,
    meta: { requiresAdmin: true },
  },
  {
    path: "/admin/orders",
    name: "AdminOrders",
    component: AdminOrdersView,
    meta: { requiresAdmin: true },
  },
  // { path: "/admin/reviews", name: "AdminReviews", component: AdminReviewsView, meta: { requiresAdmin: true } },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 };
  },
});

//  Navigation Guard
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();

  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);
  const requiresAdmin = to.matched.some((record) => record.meta.requiresAdmin);
  const isUserOnly = to.matched.some((record) => record.meta.userOnly);

  if (requiresAdmin && !authStore.isAdmin) {
    // Hanya admin boleh ke admin area
    next({ name: "AdminLogin" });
  } else if (requiresAuth && !authStore.isAuthenticated) {
    // Harus login untuk halaman yang perlu auth
    next({ name: "Login" });
  } else if (isUserOnly && authStore.isAdmin) {
    //  Admin mencoba akses halaman user-only
    next({ name: "AdminDashboard" });
  } else {
    next();
  }
});

export default router;
