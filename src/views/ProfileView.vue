<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../store/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

// State untuk tab aktif di sidebar
const activeTab = ref('overview')

// State untuk mode edit pada tab pengaturan
const isEditing = ref(false)

// Data pengguna dari store
const user = computed(() => authStore.user)

// Inisialisasi form dengan data pengguna
const form = ref({
  firstName: user.value?.firstName || '',
  lastName: user.value?.lastName || '',
  address: user.value?.address || ''
})

// Fungsi untuk menginisialisasi ulang form saat membatalkan edit
const resetForm = () => {
  form.value.firstName = user.value?.firstName || ''
  form.value.lastName = user.value?.lastName || ''
  form.value.address = user.value?.address || ''
  isEditing.value = false
}

// Fungsi untuk menyimpan perubahan
const handleUpdateProfile = async () => {
  const success = await authStore.updateUser(form.value)
  if (success) {
    isEditing.value = false
    alert('Profile updated successfully!')
  } else {
    alert('Failed to update profile.')
  }
}

const handleLogout = () => {
  authStore.logout()
  router.push('/')
}

onMounted(() => {
  if (!authStore.isAuthenticated) {
    router.push('/login')
  }
})
</script>

<template>
  <div class="bg-neutral-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 class="text-3xl font-bold text-neutral-900 mb-8">My Account</h1>

      <div class="grid grid-cols-1 lg:grid-cols-4 gap-10">
        <aside class="lg:col-span-1">
          <div class="bg-white rounded-xl shadow-sm p-6 sticky top-24">
            <div class="flex items-center space-x-4 mb-6">
              <div class="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center text-primary text-2xl font-bold">
                <span v-if="user">{{ user.firstName.charAt(0) }}{{ user.lastName.charAt(0) }}</span>
              </div>
              <div>
                <h2 class="font-bold text-lg text-neutral-900">{{ user?.firstName }} {{ user?.lastName }}</h2>
                <p class="text-sm text-neutral-600">{{ user?.email }}</p>
              </div>
            </div>
            <nav class="space-y-2">
              <button @click="activeTab = 'overview'" :class="['w-full text-left px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-3', activeTab === 'overview' ? 'bg-primary/10 text-primary font-semibold' : 'text-neutral-600 hover:bg-neutral-100']">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                Account Overview
              </button>
              <router-link to="/orders" class="w-full text-left px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-3 text-neutral-600 hover:bg-neutral-100">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
                My Orders
              </router-link>
              <button @click="activeTab = 'settings'; isEditing = false" :class="['w-full text-left px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-3', activeTab === 'settings' ? 'bg-primary/10 text-primary font-semibold' : 'text-neutral-600 hover:bg-neutral-100']">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                Profile Settings
              </button>
              <div class="pt-2 border-t">
                  <button @click="handleLogout" class="w-full text-left px-4 py-2 rounded-lg text-red-600 hover:bg-red-50/50 transition-colors duration-200 flex items-center gap-3">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                    Logout
                  </button>
              </div>
            </nav>
          </div>
        </aside>

        <main class="lg:col-span-3">
          <div class="bg-white rounded-xl shadow-sm p-8">
            <div v-if="activeTab === 'overview'">
              <h3 class="text-xl font-bold text-neutral-900 mb-2">Account Overview</h3>
              <p class="text-neutral-600 mb-6">Welcome back! Here you can see your basic account information and recent activity.</p>
              <div class="space-y-4 border-t pt-6">
                <div>
                  <label class="block text-sm font-medium text-neutral-500">Full Name</label>
                  <p class="text-lg text-neutral-800">{{ user?.firstName }} {{ user?.lastName }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-neutral-500">Email</label>
                  <p class="text-lg text-neutral-800">{{ user?.email }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-neutral-500">Primary Address</label>
                  <p class="text-lg text-neutral-800">{{ user?.address || 'Not set yet' }}</p>
                </div>
              </div>
            </div>
            
            <div v-if="activeTab === 'settings'">
              <h3 class="text-xl font-bold text-neutral-900 mb-6">Profile Settings</h3>
              
              <div v-if="!isEditing" class="space-y-6">
                 <div>
                    <label class="block text-sm font-medium text-neutral-500">First Name</label>
                    <p class="text-lg text-neutral-800">{{ user?.firstName }}</p>
                  </div>
                 <div>
                    <label class="block text-sm font-medium text-neutral-500">Last Name</label>
                    <p class="text-lg text-neutral-800">{{ user?.lastName }}</p>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-neutral-500">Address</label>
                    <p class="text-lg text-neutral-800">{{ user?.address || 'Not set yet' }}</p>
                  </div>
                  <div class="border-t pt-6">
                      <button @click="isEditing = true" class="bg-primary text-white px-5 py-2 rounded-lg font-semibold hover:bg-primary/90 transition">Edit Profile</button>
                  </div>
              </div>

              <form v-else @submit.prevent="handleUpdateProfile" class="space-y-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                      <label for="firstName" class="block text-sm font-medium text-neutral-700 mb-1">First Name</label>
                      <input type="text" v-model="form.firstName" id="firstName" class="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                  </div>
                  <div>
                      <label for="lastName" class="block text-sm font-medium text-neutral-700 mb-1">Last Name</label>
                      <input type="text" v-model="form.lastName" id="lastName" class="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                  </div>
                </div>
                <div>
                  <label for="address" class="block text-sm font-medium text-neutral-700 mb-1">Address</label>
                  <textarea v-model="form.address" id="address" rows="3" class="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"></textarea>
                </div>
                <div class="flex justify-end space-x-4 border-t pt-6">
                    <button type="button" @click="resetForm" class="bg-white px-5 py-2 border border-neutral-300 rounded-lg text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition">Cancel</button>
                    <button type="submit" class="bg-primary text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition">Save Changes</button>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  </div>
</template>
