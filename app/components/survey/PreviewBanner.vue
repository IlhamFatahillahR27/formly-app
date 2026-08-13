<template>
  <div
    v-if="isPreview"
    class="sticky top-16 z-40 w-full bg-amber-50 dark:bg-amber-950/90 border-b border-amber-200 dark:border-amber-800/60 px-3 sm:px-6 md:px-8 lg:px-4 py-2.5 shadow-sm backdrop-blur transition-all"
  >
    <div class="max-w-full sm:max-w-xl md:max-w-2xl lg:max-w-3xl mx-auto flex items-center justify-between gap-2">
      <div class="flex items-center space-x-2 text-amber-800 dark:text-amber-200 text-xs sm:text-sm font-medium">
        <UIcon name="i-heroicons-exclamation-triangle" class="w-4 h-4 aspect-square shrink-0 text-amber-600 dark:text-amber-400" />
        <span><strong>Mode Preview:</strong> Jawaban tidak akan disimpan ke database.</span>
      </div>
      <UBadge color="secondary" variant="subtle" class="shrink-0 text-xs sm:text-sm">
        Sandbox Preview
      </UBadge>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const isPreview = computed(() => route.query.preview === 'true' || route.query.preview === '1')
</script>
