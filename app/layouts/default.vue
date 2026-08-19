<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 flex flex-col">
    <AppNavbar />
    <ClientOnly>
      <DemoBanner />
    </ClientOnly>
    <main class="flex-1">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import DemoBanner from '~/components/survey/DemoBanner.vue'
</script>
