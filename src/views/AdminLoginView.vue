<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../store/auth'

const router = useRouter()
const authStore = useAuthStore()

const form = ref({
  email: '',
  password: ''
})

const loading = ref(false)
const error = ref('')

const handleLogin = async () => {
  if (!form.value.email || !form.value.password) {
    error.value = 'Please fill in all fields'
    return
  }

  loading.value = true
  error.value = ''

  const result = await authStore.login(form.value.email, form.value.password)
  
  if (result.success && authStore.isAdmin) {
    router.push('/admin/dashboard')
  } else if (result.success && !authStore.isAdmin) {
    error.value = 'Access denied. Admin privileges required.'
    authStore.logout()
  } else {
    error.value = result.error
  }

  loading.value = false
}

const fillTestAccount = () => {
  form.value.email = 'admin@gmail.com'
  form.value.password = 'admin@123'
}
</script>

<template>
  <div class="min-h-[80vh] flex items-center justify-center px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-bold text-gray-900">
          Admin Login
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Access the admin dashboard
        </p>
      </div>

      <!-- Test Admin Account Info -->
      <div class="bg-orange-50 border border-orange-200 rounded-lg p-4">
        <h3 class="text-sm font-medium text-orange-900 mb-2">Test Admin Credentials:</h3>
        <div class="text-sm text-orange-700 space-y-1">
          <p><strong>Email:</strong> admin@gmail.com</p>
          <p><strong>Password:</strong> admin@123</p>
        </div>
        <button
          @click="fillTestAccount"
          class="mt-2 text-xs bg-orange-600 text-white px-3 py-1 rounded hover:bg-orange-700 transition duration-150"
        >
          Use Test Admin Account
        </button>
      </div>

      <form @submit.prevent="handleLogin" class="mt-8 space-y-6">
        <div class="space-y-4">
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
              Admin Email
            </label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              required
              class="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent focus:z-10"
              placeholder="Enter admin email"
            >
          </div>
          
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
              Admin Password
            </label>
            <input
              id="password"
              v-model="form.password"
              type="password"
              required
              class="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent focus:z-10"
              placeholder="Enter admin password"
            >
          </div>
        </div>

        <div v-if="error" class="text-red-600 text-sm text-center">
          {{ error }}
        </div>

        <div>
          <button
            type="submit"
            :disabled="loading"
            class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition duration-150"
          >
            <span v-if="loading">Signing in...</span>
            <span v-else>Admin Sign In</span>
          </button>
        </div>

        <div class="text-center">
          <p class="text-sm text-gray-600">
            Not an admin?
            <router-link to="/login" class="font-medium text-primary hover:text-primary/80">
              User Login
            </router-link>
          </p>
        </div>
      </form>
    </div>
  </div>
</template>