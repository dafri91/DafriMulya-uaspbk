import { defineStore } from "pinia";
import {
  ref as dbRef,
  get,
  set,
  push,
  remove,
  update,
} from "firebase/database";
import { db } from "../firebase";
import { useAuthStore } from "./auth";

export const useCartStore = defineStore("cart", {
  state: () => ({
    cartItems: [],
    loading: false,
    error: null,
  }),

  getters: {
    itemCount: (state) =>
      state.cartItems.reduce((sum, item) => sum + item.quantity, 0),

    totalPrice: (state) =>
      state.cartItems.reduce(
        (sum, item) => sum + (item.product.price || 0) * item.quantity,
        0
      ),

    isEmpty: (state) => state.cartItems.length === 0,
  },

  actions: {
    /**
     * LocalStorage Helpers
     */
    loadFromLocalStorage() {
      const stored = localStorage.getItem("cartItems");
      this.cartItems = stored ? JSON.parse(stored) : [];
    },

    saveToLocalStorage() {
      localStorage.setItem("cartItems", JSON.stringify(this.cartItems));
    },

    /**
     * Load user's cart from Firebase
     */
    async fetchCart() {
      const authStore = useAuthStore();
      if (!authStore.isAuthenticated) {
        this.clearCart();
        return;
      }

      this.loading = true;
      this.error = null;

      try {
        const snapshot = await get(dbRef(db, `cart/${authStore.user.uid}`));
        if (snapshot.exists()) {
          const data = snapshot.val();
          this.cartItems = Object.entries(data).map(([id, val]) => ({
            id,
            ...val,
          }));
        } else {
          this.cartItems = [];
        }
        this.saveToLocalStorage(); //  Simpan ke local
      } catch (e) {
        this.error = e.message;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Add product to cart
     */
    async addToCart(product, quantity = 1) {
      const authStore = useAuthStore();
      if (!authStore.isAuthenticated) {
        this.error = "Please login to add items to cart.";
        console.warn("⚠️ User belum login.");
        return;
      }

      const uid = authStore.user?.uid;

      console.log("🧪 UID:", uid);
      if (!uid) {
        console.warn("❌ authStore.user.uid undefined");
        this.error = "User UID not found.";
        return;
      }

      this.loading = true;
      this.error = null;

      try {
        console.log("🛒 Menambahkan ke cart di path: cart/" + uid);
        const existing = this.cartItems.find(
          (item) => item.productId === product.id
        );

        if (existing) {
          console.log("🔄 Update quantity");
          await update(dbRef(db, `cart/${uid}/${existing.id}`), {
            quantity: existing.quantity + quantity,
          });
        } else {
          console.log("➕ Tambah produk baru");
          const newRef = push(dbRef(db, `cart/${uid}`));
          await set(newRef, {
            productId: product.id,
            product,
            quantity,
            addedAt: new Date().toISOString(),
          });
        }

        await this.fetchCart();
        this.saveToLocalStorage();
      } catch (e) {
        console.error("❌ [addToCart] Firebase Error:", e.message, e);
        this.error = e.message;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Update quantity of an item in the cart
     */
    async updateQuantity(itemId, quantity) {
      const authStore = useAuthStore();
      if (!authStore.isAuthenticated) return;

      if (quantity < 1) {
        await this.removeFromCart(itemId);
        return;
      }

      this.loading = true;
      this.error = null;

      try {
        await update(dbRef(db, `cart/${authStore.user.uid}/${itemId}`), {
          quantity,
        });
        await this.fetchCart();
        this.saveToLocalStorage();
      } catch (e) {
        this.error = e.message;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Remove item from cart
     */
    async removeFromCart(itemId) {
      const authStore = useAuthStore();
      if (!authStore.isAuthenticated) return;

      this.loading = true;
      this.error = null;

      try {
        await remove(dbRef(db, `cart/${authStore.user.uid}/${itemId}`));
        await this.fetchCart();
        this.saveToLocalStorage();
      } catch (e) {
        this.error = e.message;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Clear the entire cart
     */
    async clearCart() {
      const authStore = useAuthStore();
      if (!authStore.isAuthenticated) {
        this.cartItems = [];
        this.saveToLocalStorage();
        return;
      }

      this.loading = true;
      this.error = null;

      try {
        await remove(dbRef(db, `cart/${authStore.user.uid}`));
        this.cartItems = [];
        this.saveToLocalStorage();
      } catch (e) {
        this.error = e.message;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Clear local cart without touching DB (e.g. on logout)
     */
    clearLocalCart() {
      this.cartItems = [];
      this.loading = false;
      this.error = null;
      localStorage.removeItem("cartItems");
    },
  },
});
