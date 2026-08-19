<template>
  <div
    v-if="isDemo"
    class="sticky top-16 z-40 w-full bg-indigo-900/95 text-white border-b border-indigo-700/80 px-3 sm:px-6 md:px-8 py-2.5 shadow-md backdrop-blur transition-all"
  >
    <div class="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5">
      <div class="flex items-center space-x-2.5 text-xs sm:text-sm font-medium">
        <div class="p-1 rounded-md bg-amber-400 text-slate-900 flex items-center justify-center shrink-0">
          <UIcon name="i-heroicons-sparkles" class="w-3.5 h-3.5" />
        </div>
        <div>
          <span class="font-bold text-amber-300">Mode Demo (Guest):</span>
          <span class="text-slate-100 ml-1">Seluruh fitur dapat dicoba langsung. Perubahan data tidak akan disimpan ke database.</span>
        </div>
      </div>

      <div class="flex items-center space-x-2 shrink-0">
        <UBadge color="warning" variant="subtle" size="sm" class="hidden md:inline-flex">
          Simulasi In-Memory
        </UBadge>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useDemoMode } from '~/composables/useDemoMode'

const { isDemo } = useDemoMode()
</script>
