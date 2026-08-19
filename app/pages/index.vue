<template>
  <div class="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 text-center">
    <div class="max-w-xl space-y-6">
      <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/10 text-primary-400 text-sm font-medium border border-primary-500/20">
        <span>Formly SaaS Platform</span>
      </div>
      <h1 class="text-4xl sm:text-5xl font-extrabold tracking-tight">
        Interactive Section Flow Form Maker
      </h1>
      <p class="text-slate-400 text-lg">
        Build dynamic survey flows with node diagrams, branching section logic, and real-time response analytics.
      </p>

      <div class="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
        <ClientOnly>
          <!-- Logged in Admin Actions -->
          <template v-if="user">
            <UButton to="/admin/dashboard" color="primary" size="lg" icon="i-heroicons-arrow-right-20-solid" trailing>
              Buka Dashboard Admin
            </UButton>
          </template>

          <!-- Guest User Actions -->
          <template v-else>
            <UButton to="/admin/login" color="primary" size="lg" icon="i-heroicons-arrow-right-20-solid" trailing>
              Admin Portal
            </UButton>
            <UButton
              to="/admin/dashboard?demo=true"
              color="warning"
              variant="subtle"
              size="lg"
              icon="i-heroicons-sparkles"
            >
              Coba Demo Interaktif
            </UButton>
          </template>

          <template #fallback>
            <UButton to="/admin/login" color="primary" size="lg" icon="i-heroicons-arrow-right-20-solid" trailing>
              Admin Portal
            </UButton>
            <UButton
              to="/admin/dashboard?demo=true"
              color="warning"
              variant="subtle"
              size="lg"
              icon="i-heroicons-sparkles"
            >
              Coba Demo Interaktif
            </UButton>
          </template>
        </ClientOnly>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const user = useSupabaseUser()
</script>
