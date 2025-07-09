
# ElectroShop 🛒 – Aplikasi E-Commerce Elektronik (Vue 3 + Firebase)

Proyek ini merupakan **tugas akhir UAS** dari mata kuliah *Pemrograman Berbasis Komponen (PBK)*. Aplikasi ini bernama **ElectroShop**, yaitu sebuah website e-commerce produk elektronik yang dikembangkan dengan pendekatan berbasis komponen menggunakan Vue.js 3.

---

## 🧱 Teknologi yang Digunakan

| Teknologi | Keterangan |
|----------|------------|
| **Vue 3 (Composition API)** | Framework frontend berbasis komponen |
| **Pinia** | State management global |
| **Vue Router (History Mode)** | Navigasi halaman SPA |
| **Firebase Realtime Database** | Backend realtime berbasis JSON tree |
| **Tailwind CSS v3** | Styling UI yang cepat dan utility-first |
| **Vitest** | Unit testing logic store (auth, cart, dsb) |
| **Vite** | Tooling build & dev server modern |
| **JSON-Server** | Mock API pada tahap pengembangan awal |

**Catatan:**  
Pada awal pengembangan, **JSON-Server** digunakan sebagai backend lokal sementara, untuk memudahkan prototipe dan testing awal frontend. Setelah itu, proyek bermigrasi sepenuhnya ke **Firebase Realtime Database** agar aplikasi bisa berjalan secara online saat deploy.

---

##  Fitur Aplikasi

### 👤 Untuk Pengguna (User)
- 🔐 Register & Login
- 🛍️ Menjelajahi katalog produk
- 🔎 Filter berdasarkan kategori & brand
- ❤️ Tambah ke daftar favorit (wishlist)
- 🛒 Kelola keranjang belanja
- 📦 Checkout dengan validasi
- 📄 Lihat riwayat pesanan

### 🛠️ Untuk Admin
- 📊 Dashboard admin
- 📦 CRUD Produk
- 📋 Manajemen pesanan
- 🔐 Akses admin terproteksi (route guards)
---

## 🔐 Struktur Navigasi Halaman

### Untuk User:
- `/` – Home
- `/products` – Katalog Produk
- `/favorites` – Daftar Favorit
- `/cart` – Keranjang Belanja
- `/checkout` – Proses Checkout
- `/orders` – Riwayat Pesanan
- `/profile` – Profil

### Untuk Admin:
- `/admin/dashboard` – Dashboard
- `/admin/products` – Manajemen Produk
- `/admin/orders` – Manajemen Pesanan

---

## 🌐 Struktur Firebase Realtime Database

```json
/users/{uid}           → Data pengguna (nama, email, role)
/products/{id}         → Detail produk
/categories/{id}       → Kategori produk
/cart/{uid}/{itemId}   → Item keranjang per user
/favorites/{uid}/{id}  → Daftar produk favorit
/orders/{uid}/{orderId}→ Riwayat pesanan per user
```

---

## 🧪 Unit Testing

Proyek ini menggunakan **Vitest** untuk menguji logic pada store seperti `auth.js`.

Contoh sederhana:

```js
describe('auth store', () => {
  it('should login user', () => {
    const store = useAuthStore()
    store.login({ email: 'admin@gmail.com' })
    expect(store.isAuthenticated).toBe(true)
  })
})
```

Menjalankan test:

```bash
npx vitest run
```

---

## 🖥️ Tampilan Responsif

Aplikasi ini telah dioptimalkan untuk tampil **responsif** di berbagai perangkat:

* ✅ **Desktop**: Navigasi lengkap, sidebar admin, tabel pesanan
* ✅ **Tablet**: Grid produk fleksibel, UI tetap terbaca
* ✅ **Mobile**: Navigasi collapse (hamburger), checkout ringan

Tailwind CSS v3 mempermudah pengaturan responsif menggunakan breakpoint seperti `md:`, `lg:`, dan `xl:`.

---

## 🚀 Cara Menjalankan Proyek

1. Clone repo:

   ```bash
   git clone https://github.com/namamu/electroshop.git
   cd electroshop
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Jalankan server development:

   ```bash
   npm run dev
   ```

4. Buka browser di:

   ```
   http://localhost:5173
   ```

---


> ElectroShop menunjukkan bagaimana teknologi modern seperti Vue 3, Pinia, Firebase, dan Tailwind CSS dapat diterapkan dalam pembuatan aplikasi web berbasis komponen secara nyata. Proyek ini dapat dijadikan dasar pengembangan e-commerce berskala lebih besar.
