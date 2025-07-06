import { useAuthStore } from "../store/auth";
import { useRouter } from "vue-router";

export function useRequireAuth() {
  const authStore = useAuthStore();
  const router = useRouter();

  function checkAuth() {
    if (!authStore.isAuthenticated) {
      router.push("/login");
      return false;
    }
    return true;
  }

  return { checkAuth };
}
