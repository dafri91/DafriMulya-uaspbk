import { defineStore } from "pinia";
import { db, ref, push, set, get, update } from "../firebase";
import { useAuthStore } from "./auth";

export const useOrdersStore = defineStore("orders", {
  state: () => ({
    orders: [],
    loading: false,
    error: null,
  }),

  getters: {
    userOrders: (state) => {
      const authStore = useAuthStore();
      if (!authStore.user) return [];
      return state.orders.filter(
        (order) => order.userId === authStore.user.uid
      );
    },
  },

  actions: {
    // User create their own order
    async createOrder(orderData) {
      this.loading = true;
      this.error = null;
      const authStore = useAuthStore();

      try {
        const newRef = push(ref(db, `orders/${authStore.user.uid}`));
        await set(newRef, {
          ...orderData,
          createdAt: new Date().toISOString(),
          status: "pending",
        });

        await this.fetchOrders();
        return { success: true };
      } catch (e) {
        this.error = e.message;
        return { success: false, error: e.message };
      } finally {
        this.loading = false;
      }
    },

    // Fetch orders for admin or user
    async fetchOrders() {
      this.loading = true;
      this.error = null;
      const authStore = useAuthStore();

      try {
        if (authStore.isAdmin) {
          // Admin sees all orders
          const snapshot = await get(ref(db, "orders"));
          if (snapshot.exists()) {
            const allOrders = [];
            const data = snapshot.val();

            for (const uid in data) {
              const userOrders = data[uid];
              for (const orderId in userOrders) {
                const order = userOrders[orderId];
                allOrders.push({
                  id: orderId,
                  userId: uid,
                  shippingName: order?.shippingAddress
                    ? `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`
                    : "",
                  ...order,
                });
              }
            }

            this.orders = allOrders;
          } else {
            this.orders = [];
          }
        } else if (authStore.isAuthenticated) {
          // User sees their own orders
          const snapshot = await get(ref(db, `orders/${authStore.user.uid}`));
          if (snapshot.exists()) {
            this.orders = Object.entries(snapshot.val()).map(([id, val]) => ({
              id,
              userId: authStore.user.uid,
              shippingName: val?.shippingAddress
                ? `${val.shippingAddress.firstName} ${val.shippingAddress.lastName}`
                : "",
              ...val,
            }));
          } else {
            this.orders = [];
          }
        } else {
          this.clearOrders();
        }
      } catch (e) {
        this.error = e.message;
      } finally {
        this.loading = false;
      }
    },

    // Admin update order status
    async updateOrderStatus(orderId, newStatus) {
      const authStore = useAuthStore();
      if (!authStore.isAdmin) {
        throw new Error("Only admin can update order status");
      }

      try {
        // Find UID for the order
        const snapshot = await get(ref(db, "orders"));
        if (!snapshot.exists()) throw new Error("Orders not found");

        const allOrders = snapshot.val();
        let targetUid = null;

        for (const uid in allOrders) {
          if (orderId in allOrders[uid]) {
            targetUid = uid;
            break;
          }
        }

        if (!targetUid) throw new Error("Order not found");

        // Update the order status
        await update(ref(db, `orders/${targetUid}/${orderId}`), {
          status: newStatus,
        });

        await this.fetchOrders();
      } catch (e) {
        this.error = e.message;
        console.error("Failed to update order status:", e);
      }
    },

    clearOrders() {
      this.orders = [];
      this.loading = false;
      this.error = null;
    },
  },
});
