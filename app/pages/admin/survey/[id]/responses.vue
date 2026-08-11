<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
    <div class="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-5">
      <div>
        <NuxtLink to="/admin/dashboard" class="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mb-2 transition-colors">
          <UIcon name="i-heroicons-arrow-left" class="w-4 h-4 mr-1" />
          Kembali ke Dashboard
        </NuxtLink>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          Detail Respon Survei (ID: {{ surveyId }})
        </h1>
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Tabel riwayat jawaban responden dan fitur unduh CSV.
        </p>
      </div>
    </div>

    <UCard class="p-8 text-center border border-dashed border-gray-300 dark:border-gray-700">
      <UIcon name="i-heroicons-inbox" class="w-12 h-12 text-primary-500 mx-auto mb-3" />
      <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
        Fitur Detail Respon &amp; CSV Export (Phase 7)
      </h2>
      <p class="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-md mx-auto">
        Tabel respon individual dan fitur ekspor CSV akan diimplementasikan pada Phase 7.
      </p>
    </UCard>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
})

const route = useRoute()
const surveyId = computed(() => route.params.id)
</script>
