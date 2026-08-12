<template>
  <div class="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
    <UCard class="w-full max-w-md shadow-xl border border-gray-200 dark:border-gray-800">
      <template #header>
        <div class="text-center py-2">
          <h1 class="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Admin Login
          </h1>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Masuk ke portal Admin Formly SaaS
          </p>
        </div>
      </template>

      <!-- Alert Error Notification -->
      <UAlert
        v-if="errorMessage"
        color="error"
        variant="subtle"
        title="Gagal Login"
        :description="errorMessage"
        class="mb-4 bg-red-50 dark:bg-red-950/80 border border-red-200 dark:border-red-800 text-red-900 dark:text-red-200 shadow-sm"
        icon="i-heroicons-exclamation-triangle"
      />

      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Email Admin
          </label>
          <UInput
            v-model="email"
            type="email"
            placeholder="admin@formly.com"
            icon="i-heroicons-envelope"
            required
            class="w-full"
            :disabled="isLoading"
          />
        </div>

        <PasswordInput
          v-model="password"
          :disabled="isLoading"
          :required="true"
        />

        <UButton
          type="submit"
          color="primary"
          block
          size="lg"
          class="w-full mt-6"
          :loading="isLoading"
        >
          Masuk Akun Admin
        </UButton>
      </form>
    </UCard>
  </div>
</template>

<script setup lang="ts">
const user = useSupabaseUser()
const supabase = useSupabaseClient()
const router = useRouter()
const toast = useToast?.()

const email = ref('')
const password = ref('')
const isLoading = ref(false)
const errorMessage = ref('')

// Auto-redirect if already logged in
onMounted(() => {
  if (user.value) {
    router.push('/admin/dashboard')
  }
})

watch(user, (newUser) => {
  if (newUser) {
    router.push('/admin/dashboard')
  }
})

async function handleLogin() {
  errorMessage.value = ''

  if (!email.value.trim() || !password.value) {
    errorMessage.value = 'Email dan password tidak boleh kosong.'
    return
  }

  isLoading.value = true

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.value.trim(),
      password: password.value,
    })

    if (error) {
      errorMessage.value = error.message === 'Invalid login credentials' 
        ? 'Email atau password salah. Silakan periksa kembali.'
        : error.message
      
      if (toast) {
        toast.add({
          title: 'Login Gagal',
          description: errorMessage.value,
          color: 'error',
        })
      }
    } else if (data.user) {
      if (toast) {
        toast.add({
          title: 'Login Berhasil',
          description: 'Selamat datang kembali di Dashboard Admin!',
          color: 'success',
        })
      }
      await router.push('/admin/dashboard')
    }
  } catch (err: unknown) {
    errorMessage.value = err instanceof Error ? err.message : 'Terjadi kesalahan sistem.'
  } finally {
    isLoading.value = false
  }
}
</script>
