<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
    <div class="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-5">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
          Admin Dashboard
        </h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Kelola survei, analisis grafik respon, dan visual canvas flow.
        </p>
      </div>
      <NuxtLink to="/admin/survey/create">
        <UButton color="primary" icon="i-heroicons-plus">
          Buat Survei Baru
        </UButton>
      </NuxtLink>
    </div>

    <!-- Active User Welcome Banner -->
    <UCard class="bg-linear-to-r from-primary-500/10 to-primary-600/5 border-primary-200 dark:border-primary-900">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
            Selamat datang, {{ user?.email }}
          </h2>
          <p class="text-xs text-gray-600 dark:text-gray-400 mt-1">
            Status Autentikasi: Terverifikasi (Session Active)
          </p>
        </div>
        <UBadge color="success" variant="solid">
          Session Active
        </UBadge>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
const user = useSupabaseUser()
</script>
