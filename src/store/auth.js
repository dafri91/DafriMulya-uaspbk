import { defineStore } from "pinia";
import { auth, db, ref, set, get } from "../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";

import { useCartStore } from "./cart";
import { useFavoritesStore } from "./favorites";
import { useOrdersStore } from "./orders";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: JSON.parse(localStorage.getItem("user")) || null,
    loading: false,
    error: null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.user,
    isAdmin: (state) => state.user?.role === "admin",
  },

  actions: {
    /**
     * Register user
     */
    async register({ firstName, lastName, email, password }) {
      this.loading = true;
      this.error = null;

      try {
        const cred = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        const uid = cred.user.uid;

        // Jangan simpan UID di memori saja, tapi juga ke database
        const userData = {
          email,
          firstName,
          lastName,
          role: "user",
          createdAt: new Date().toISOString(),
          uid, // ✅ Pastikan UID ikut disimpan
        };

        await set(ref(db, `users/${uid}`), userData);

        this.user = userData;
        localStorage.setItem("user", JSON.stringify(this.user));

        console.log("✅ Registered user:", this.user);
        return { success: true };
      } catch (e) {
        this.error = e.message;
        return { success: false, error: e.message };
      } finally {
        this.loading = false;
      }
    },

    /**
     * Login user
     */
    async login(email, password) {
      this.loading = true;
      this.error = null;

      try {
        const cred = await signInWithEmailAndPassword(auth, email, password);
        const uid = cred.user.uid;

        const snapshot = await get(ref(db, `users/${uid}`));
        if (snapshot.exists()) {
          const userData = snapshot.val();

          // Jangan hilangkan UID! Tambahkan uid ke hasil snapshot
          this.user = { ...userData, uid };
          localStorage.setItem("user", JSON.stringify(this.user));

          console.log("✅ Logged in user:", this.user);

          // Fetch related stores
          const cartStore = useCartStore();
          await cartStore.fetchCart();

          const ordersStore = useOrdersStore();
          await ordersStore.fetchOrders();

          return { success: true };
        } else {
          this.error = "User data not found in database.";
          return { success: false, error: this.error };
        }
      } catch (e) {
        this.error = e.message;
        return { success: false, error: e.message };
      } finally {
        this.loading = false;
      }
    },

    /**
     * Logout
     */
    async logout() {
      await signOut(auth);

      this.user = null;
      localStorage.removeItem("user");

      const cartStore = useCartStore();
      const favoritesStore = useFavoritesStore();
      const ordersStore = useOrdersStore();

      cartStore.clearLocalCart?.();
      favoritesStore.clearFavorites?.();
      ordersStore.clearOrders?.();

      console.log("✅ User logged out, state cleared.");
    },

    /**
     * Load user from localStorage
     */
    loadFromLocal() {
      const u = localStorage.getItem("user");
      this.user = u ? JSON.parse(u) : null;

      console.log("🔄 Loaded user from localStorage:", this.user);

      // Safety: pastikan UID ada
      if (this.user && !this.user.uid) {
        console.warn("⚠️ User in localStorage missing UID! Forcing logout.");
        this.user = null;
        localStorage.removeItem("user");
      }
    },

    /**
     * Update user in DB
     */
    async updateUser(updatedData) {
      if (!this.user || !this.user.uid) return false;

      try {
        const newUser = {
          ...this.user,
          ...updatedData,
        };

        await set(ref(db, `users/${this.user.uid}`), newUser);
        this.user = newUser;
        localStorage.setItem("user", JSON.stringify(this.user));

        console.log("✅ Updated user:", this.user);
        return true;
      } catch (e) {
        console.error("❌ Failed to update user:", e);
        return false;
      }
    },

    /**
     * Fetch latest user from DB
     */
    async fetchUser() {
      if (!this.user?.uid) return;

      this.loading = true;
      this.error = null;

      try {
        const snapshot = await get(ref(db, `users/${this.user.uid}`));
        if (snapshot.exists()) {
          const userData = snapshot.val();

          this.user = { ...userData, uid: this.user.uid };
          localStorage.setItem("user", JSON.stringify(this.user));

          console.log("✅ Fetched user from DB:", this.user);
        }
      } catch (e) {
        console.error("❌ Failed to fetch user from DB:", e);
        this.error = e.message;
      } finally {
        this.loading = false;
      }
    },
  },
});
