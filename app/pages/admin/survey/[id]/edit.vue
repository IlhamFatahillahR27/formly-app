<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
    <!-- Header Navigation & Actions -->
    <div class="flex flex-wrap items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-5 gap-4">
      <div>
        <NuxtLink
          to="/admin/dashboard"
          class="inline-flex items-center text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mb-2 transition-colors"
        >
          <UIcon name="i-heroicons-arrow-left" class="w-4 h-4 mr-1" />
          Kembali ke Dashboard
        </NuxtLink>
        <div class="flex items-center space-x-3">
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
            {{ survey?.title || 'Survey Builder' }}
          </h1>
          <UBadge
            v-if="survey"
            :color="survey.is_active ? 'emerald' : 'gray'"
            variant="soft"
            size="xs"
          >
            {{ survey.is_active ? 'Aktif / Publik' : 'Non-Aktif' }}
          </UBadge>
        </div>
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Dual-Mode Form Linear Editor &amp; Visual Canvas Flow Designer.
        </p>
      </div>

      <div class="flex items-center space-x-3">
        <!-- Saving Status Indicator -->
        <div v-if="saving" class="flex items-center text-xs text-primary-500 space-x-1">
          <UIcon name="i-heroicons-arrow-path" class="w-4 h-4 animate-spin" />
          <span>Menyimpan...</span>
        </div>
        <div v-else-if="saveSuccessMessage" class="flex items-center text-xs text-emerald-500 space-x-1">
          <UIcon name="i-heroicons-check" class="w-4 h-4" />
          <span>{{ saveSuccessMessage }}</span>
        </div>

        <!-- Manual Save Button -->
        <UButton
          color="primary"
          variant="solid"
          icon="i-heroicons-cloud-arrow-up"
          size="sm"
          :loading="saving"
          @click="onManualSave"
        >
          Simpan
        </UButton>

        <!-- Preview Button -->
        <UButton
          color="emerald"
          variant="soft"
          icon="i-heroicons-eye"
          size="sm"
          @click="openPreview"
        >
          Preview Mode
        </UButton>
      </div>
    </div>

    <!-- Alert / Error display -->
    <UAlert
      v-if="error"
      color="error"
      variant="soft"
      icon="i-heroicons-exclamation-triangle"
      :title="error"
      class="mb-4"
    />

    <!-- Loading State -->
    <div v-if="loading" class="p-12 text-center">
      <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 text-primary-500 animate-spin mx-auto mb-2" />
      <p class="text-xs text-gray-500">Memuat struktur survei...</p>
    </div>

    <!-- Dual Mode Tab Switcher & Editor View -->
    <div v-else class="space-y-6">
      <!-- Tab Header Navigation Bar -->
      <div class="border-b border-gray-200 dark:border-gray-800">
        <nav class="-mb-px flex space-x-6" aria-label="Tabs">
          <button
            type="button"
            @click="activeTabKey = 'linear'"
            :class="[
              activeTabKey === 'linear'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400 font-bold'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200',
              'whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm flex items-center transition-colors cursor-pointer'
            ]"
          >
            <UIcon name="i-heroicons-list-bullet" class="w-4 h-4 mr-2" />
            Form Linear Editor
          </button>

          <button
            type="button"
            @click="activeTabKey = 'canvas'"
            :class="[
              activeTabKey === 'canvas'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400 font-bold'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200',
              'whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm flex items-center transition-colors cursor-pointer'
            ]"
          >
            <UIcon name="i-heroicons-squares-2x2" class="w-4 h-4 mr-2" />
            Canvas Flow Designer
          </button>
        </nav>
      </div>

      <!-- Tab Content Area -->
      <div class="pt-2">
        <FormLinearEditor v-if="activeTabKey === 'linear'" />
        <CanvasFlowDesigner v-else-if="activeTabKey === 'canvas'" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSurveyBuilder } from '~/composables/useSurveyBuilder'
import FormLinearEditor from '~/components/builder/FormLinearEditor.vue'
import CanvasFlowDesigner from '~/components/builder/CanvasFlowDesigner.vue'

definePageMeta({
  middleware: 'auth',
})

const route = useRoute()
const surveyId = computed(() => String(route.params.id || ''))

const { survey, loading, saving, error, loadSurveyData } = useSurveyBuilder()

const activeTabKey = ref<'linear' | 'canvas'>('linear')
const saveSuccessMessage = ref('')

onMounted(async () => {
  if (surveyId.value) {
    await loadSurveyData(surveyId.value)
  }
})

async function onManualSave() {
  if (surveyId.value) {
    const success = await loadSurveyData(surveyId.value)
    if (success) {
      saveSuccessMessage.value = 'Perubahan Tersimpan'
      setTimeout(() => {
        saveSuccessMessage.value = ''
      }, 3000)
    }
  }
}

function openPreview() {
  if (surveyId.value) {
    window.open(`/survey/${surveyId.value}?preview=true`, '_blank')
  }
}
</script>
