<template>
  <header class="border-b border-gray-200 dark:border-gray-800 bg-white/75 dark:bg-gray-900/75 backdrop-blur sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
      <!-- Brand / Logo -->
      <NuxtLink to="/" class="flex items-center gap-2 font-bold text-xl text-gray-900 dark:text-white">
        <span class="text-primary-600 dark:text-primary-400">📑 Formly</span>
      </NuxtLink>

      <!-- Auth State & Actions with ClientOnly wrapper to prevent hydration mismatch -->
      <div class="flex items-center gap-4">
        <ClientOnly>
          <template v-if="user">
            <div class="flex items-center gap-2">
              <span class="text-xs bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded-full text-gray-700 dark:text-gray-300 font-mono">
                {{ user.email }}
              </span>
              <UButton 
                color="error" 
                variant="soft" 
                size="xs" 
                :loading="isLoggingOut"
                @click="handleLogout"
              >
                Logout
              </UButton>
            </div>
          </template>
        </ClientOnly>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
const user = useSupabaseUser()
const supabase = useSupabaseClient()
const route = useRoute()
const router = useRouter()
const toast = useToast?.()

const isLoggingOut = ref(false)

async function handleLogout() {
  isLoggingOut.value = true
  try {
    const { error } = await supabase.auth.signOut()
    if (error) {
      if (toast) {
        toast.add({
          title: 'Logout Failed',
          description: error.message,
          color: 'error',
        })
      }
    } else {
      if (toast) {
        toast.add({
          title: 'Logged Out',
          description: 'Anda telah berhasil keluar dari akun Admin.',
          color: 'success',
        })
      }
      await router.push('/admin/login')
    }
  } catch (err: unknown) {
    console.error('Logout error:', err)
  } finally {
    isLoggingOut.value = false
  }
}
</script>
