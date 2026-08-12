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
          <div class="flex items-center space-x-2">
            <USwitch
              v-if="survey"
              :model-value="survey.is_active"
              size="sm"
              color="primary"
              title="Aktifkan / Menonaktifkan Sesi Survei"
              @update:model-value="handleToggleStatus"
            />
            <button
              v-if="survey"
              type="button"
              class="cursor-pointer"
              @click="handleToggleStatus(!survey.is_active)"
            >
              <UBadge
                :color="survey.is_active ? 'success' : 'neutral'"
                variant="soft"
                size="sm"
              >
                {{ survey.is_active ? 'Aktif / Publik' : 'Non-Aktif' }}
              </UBadge>
            </button>
          </div>
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

        <!-- Share & QR Button -->
        <UButton
          color="info"
          variant="soft"
          icon="i-heroicons-share"
          size="sm"
          @click="isShareModalOpen = true"
        >
          Bagikan &amp; QR
        </UButton>

        <!-- Preview Button -->
        <UButton
          color="success"
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
            class="py-3 px-1 border-b-2 font-medium text-sm inline-flex items-center space-x-2 transition-colors cursor-pointer"
            :class="[
              activeTab === 'linear'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            ]"
            @click="activeTab = 'linear'"
          >
            <UIcon name="i-heroicons-bars-3-bottom-left" class="w-4 h-4" />
            <span>Form Linear Editor</span>
          </button>

          <button
            type="button"
            class="py-3 px-1 border-b-2 font-medium text-sm inline-flex items-center space-x-2 transition-colors cursor-pointer"
            :class="[
              activeTab === 'canvas'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            ]"
            @click="activeTab = 'canvas'"
          >
            <UIcon name="i-heroicons-cube-transparent" class="w-4 h-4" />
            <span>Canvas Flow Designer</span>
          </button>
        </nav>
      </div>

      <!-- Tab Content 1: Form Linear Editor -->
      <div v-if="activeTab === 'linear'">
        <FormLinearEditor />
      </div>

      <!-- Tab Content 2: Canvas Flow Designer -->
      <div v-else-if="activeTab === 'canvas'">
        <CanvasFlowDesigner />
      </div>
    </div>

    <!-- Share & QR Modal Exporter -->
    <ShareSurveyModal
      v-model:open="isShareModalOpen"
      :survey="survey"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useSurveyBuilder } from '~/composables/useSurveyBuilder'
import FormLinearEditor from '~/components/builder/FormLinearEditor.vue'
import CanvasFlowDesigner from '~/components/builder/CanvasFlowDesigner.vue'
import ShareSurveyModal from '~/components/survey/ShareSurveyModal.vue'

definePageMeta({
  middleware: 'auth',
})

const route = useRoute()
const toast = useToast()
const surveyId = computed(() => String(route.params.id))

const { survey, loading, saving, error, loadSurveyData, toggleSurveyStatus } = useSurveyBuilder()

const activeTab = ref<'linear' | 'canvas'>('linear')
const saveSuccessMessage = ref<string | null>(null)
const isShareModalOpen = ref(false)

onMounted(async () => {
  if (surveyId.value) {
    await loadSurveyData(surveyId.value)
  }
})

async function handleToggleStatus(newVal: boolean) {
  if (!survey.value) return
  const success = await toggleSurveyStatus(newVal)
  if (success) {
    toast.add({
      title: 'Status Diperbarui',
      description: `Survei sekarang ${newVal ? 'Aktif / Publik' : 'Non-Aktif (Ditutup)'}.`,
      color: 'success',
      icon: 'i-heroicons-check-circle',
    })
  } else {
    toast.add({
      title: 'Gagal Mengubah Status',
      description: error.value || 'Terjadi kesalahan saat mengubah status.',
      color: 'error',
      icon: 'i-heroicons-exclamation-circle',
    })
  }
}

function onManualSave() {
  saveSuccessMessage.value = 'Perubahan disimpan.'
  setTimeout(() => {
    saveSuccessMessage.value = null
  }, 3000)
}

function openPreview() {
  if (!surveyId.value) return
  window.open(`/survey/${surveyId.value}?preview=true`, '_blank')
}
</script>
