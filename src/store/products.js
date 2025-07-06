// store/products.js
import { defineStore } from "pinia";
import { db, ref, get, push, set, update, remove } from "../firebase";

// 🔧 Sinonim berdasarkan kategori
const categorySynonyms = {
  Laptops: ["laptop", "notebook", "macbook", "asus", "dell", "lenovo", "acer"],
  Smartphones: [
    "hp",
    "handphone",
    "smartphone",
    "ponsel",
    "xiaomi",
    "samsung",
    "android",
  ],
  Audio: [
    "headset",
    "earphone",
    "headphone",
    "buds",
    "audio",
    "sony",
    "anker",
    "logitech",
  ],
  Accessories: [
    "charger",
    "usb",
    "mouse",
    "keyboard",
    "cable",
    "accessory",
    "logitech",
    "anker",
  ],
  "Gaming Consoles": [
    "console",
    "game",
    "ps",
    "nintendo",
    "playstation",
    "switch",
  ],
  Wearables: [
    "jam",
    "smartwatch",
    "gelang",
    "wearable",
    "watch",
    "band",
    "xiaomi",
  ],
  Tablets: ["tablet", "ipad"],
  Monitors: ["monitor", "display", "layar"],
  Televisions: ["tv", "televisi", "oled", "smart tv", "lg", "samsung"],
  "Gaming Peripherals": ["mouse", "keyboard", "keychron", "razer", "gaming"],
};

//  Pencarian relevan berdasarkan sinonim + kategori
function doesProductMatchSearch(product, query) {
  const lowerQuery = query.toLowerCase().trim();
  const name = product.name?.toLowerCase() || "";
  const brand = product.brand?.toLowerCase() || "";
  const desc = product.description?.toLowerCase() || "";
  const category = product.category;

  // Cocok langsung
  if (
    name.includes(lowerQuery) ||
    brand.includes(lowerQuery) ||
    desc.includes(lowerQuery)
  ) {
    return true;
  }

  // Cek sinonim dari kategori produk
  const synonyms = categorySynonyms[category] || [];
  return synonyms.some(
    (syn) => lowerQuery.includes(syn) || syn.includes(lowerQuery)
  );
}

export const useProductsStore = defineStore("products", {
  state: () => ({
    products: [],
    categories: [],
    currentProduct: null,
    loading: false,
    error: null,
    selectedCategory: null,
    selectedBrand: "",
    sortOption: "default",
    searchQuery: "",
  }),
  getters: {
    featuredProducts: (state) => {
      return state.products.filter((product) => product.featured);
    },

    filteredProducts: (state) => {
      let result = state.products;

      // Filter kategori
      if (
        state.selectedCategory &&
        state.selectedCategory !== "All Categories"
      ) {
        result = result.filter((p) => p.category === state.selectedCategory);
      }

      // Filter brand
      if (state.selectedBrand) {
        result = result.filter((p) => p.brand === state.selectedBrand);
      }

      // Filter pencarian menggunakan sinonim kategori
      if (state.searchQuery.trim() !== "") {
        result = result.filter((p) =>
          doesProductMatchSearch(p, state.searchQuery)
        );
      }

      return result;
    },

    sortedAndFilteredProducts(state) {
      let result = [...this.filteredProducts];
      if (state.sortOption === "priceLow") {
        result.sort((a, b) => a.price - b.price);
      } else if (state.sortOption === "priceHigh") {
        result.sort((a, b) => b.price - a.price);
      }
      return result;
    },

    getRecommendations: (state) => (productId) => {
      return state.products.filter((p) => p.id !== productId).slice(0, 4);
    },

    brands: (state) => {
      const allBrands = state.products.map((p) => p.brand).filter(Boolean);
      return [...new Set(allBrands)];
    },
  },

  actions: {
    async fetchProducts() {
      this.loading = true;
      this.error = null;
      try {
        const snapshot = await get(ref(db, "products"));
        if (snapshot.exists()) {
          this.products = Object.entries(snapshot.val()).map(([id, val]) => ({
            id,
            ...val,
          }));
        } else {
          this.products = [];
        }
      } catch (e) {
        this.error = e.message;
        console.error("Firebase fetchProducts error:", e);
      } finally {
        this.loading = false;
      }
    },

    async fetchCategories() {
      this.loading = true;
      this.error = null;
      try {
        const snapshot = await get(ref(db, "categories"));
        if (snapshot.exists()) {
          const data = Object.entries(snapshot.val()).map(([id, val]) => ({
            id,
            ...val,
          }));
          const clean = data.filter(
            (c) => c.name?.toLowerCase().trim() !== "all categories"
          );
          this.categories = [{ id: "__all", name: "All Categories" }, ...clean];
        } else {
          this.categories = [{ id: "__all", name: "All Categories" }];
        }
      } catch (e) {
        this.error = e.message;
      } finally {
        this.loading = false;
      }
    },

    async fetchProduct(id) {
      this.loading = true;
      this.error = null;
      try {
        const localProduct = this.products.find((p) => p.id === id);
        if (localProduct) {
          this.currentProduct = localProduct;
        } else {
          const snapshot = await get(ref(db, `products/${id}`));
          this.currentProduct = snapshot.exists()
            ? { id, ...snapshot.val() }
            : null;
        }
      } catch (e) {
        this.error = e.message;
      } finally {
        this.loading = false;
      }
    },

    async addProduct(productData) {
      this.loading = true;
      try {
        const newRef = push(ref(db, "products"));
        await set(newRef, {
          ...productData,
          createdAt: new Date().toISOString(),
        });
        await this.fetchProducts();
        return { success: true };
      } catch (e) {
        this.error = e.message;
        return { success: false, error: e.message };
      } finally {
        this.loading = false;
      }
    },

    async updateProduct(id, productData) {
      try {
        await update(ref(db, `products/${id}`), {
          ...productData,
          updatedAt: new Date().toISOString(),
        });
        await this.fetchProducts();
        return { success: true };
      } catch (e) {
        this.error = e.message;
        return { success: false, error: e.message };
      }
    },

    async deleteProduct(id) {
      try {
        await remove(ref(db, `products/${id}`));
        await this.fetchProducts();
      } catch (e) {
        this.error = e.message;
      }
    },

    setSelectedCategory(categoryName) {
      this.selectedCategory = categoryName || null;
    },

    setSelectedBrand(brand) {
      this.selectedBrand = brand || "";
    },

    setSortOption(option) {
      this.sortOption = option;
    },

    setSearchQuery(query) {
      this.searchQuery = query;
    },

    clearFilters() {
      this.selectedCategory = null;
      this.selectedBrand = "";
      this.sortOption = "default";
      this.searchQuery = "";
    },
  },
});
