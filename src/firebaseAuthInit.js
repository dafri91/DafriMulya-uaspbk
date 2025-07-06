// src/firebaseAuthInit.js
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { get, ref } from "firebase/database";
import { db } from "./firebase"; // ⬅️ penting
import { useAuthStore } from "./store/auth";
import { useCartStore } from "./store/cart";
import { useFavoritesStore } from "./store/favorites";

export const initFirebaseAuth = () => {
  const auth = getAuth();
  const authStore = useAuthStore();
  const cartStore = useCartStore();
  const favoritesStore = useFavoritesStore();

  onAuthStateChanged(auth, async (user) => {
    if (user) {
      const uid = user.uid;
      try {
        const snapshot = await get(ref(db, `users/${uid}`)); // ⬅️ fix: langsung pakai db
        if (snapshot.exists()) {
          const userData = snapshot.val();
          authStore.user = userData;
          localStorage.setItem("user", JSON.stringify(userData));

          await cartStore.fetchCart();
          await favoritesStore.fetchFavorites?.();
        }
      } catch (error) {
        console.error("❌ Gagal ambil data user:", error.message);
      }
    } else {
      authStore.user = null;
      localStorage.removeItem("user");
      cartStore.clearLocalCart();
      favoritesStore.clearFavorites?.();
    }
  });
};
