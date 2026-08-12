<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
    <!-- Dashboard Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-gray-200 dark:border-gray-800 pb-5 gap-4">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
          Admin Dashboard
        </h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Kelola survei, analisis grafik respon, dan visual canvas flow.
        </p>
      </div>
      <NuxtLink to="/admin/survey/create">
        <UButton color="primary" icon="i-heroicons-plus" size="lg">
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

    <!-- Search & Filter Controls -->
    <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
      <div class="w-full sm:w-80">
        <UInput
          v-model="searchQuery"
          placeholder="Cari berdasarkan judul survei..."
          icon="i-heroicons-magnifying-glass"
          class="w-full"
        />
      </div>
      <div class="flex items-center space-x-2 w-full sm:w-auto">
        <span class="text-xs text-gray-500 dark:text-gray-400 font-medium">Filter Status:</span>
        <UButton
          size="xs"
          :variant="statusFilter === 'all' ? 'solid' : 'ghost'"
          :color="statusFilter === 'all' ? 'primary' : 'neutral'"
          @click="statusFilter = 'all'"
        >
          Semua ({{ surveys.length }})
        </UButton>
        <UButton
          size="xs"
          :variant="statusFilter === 'active' ? 'solid' : 'ghost'"
          :color="statusFilter === 'active' ? 'success' : 'neutral'"
          @click="statusFilter = 'active'"
        >
          Aktif
        </UButton>
        <UButton
          size="xs"
          :variant="statusFilter === 'inactive' ? 'solid' : 'ghost'"
          :color="statusFilter === 'inactive' ? 'neutral' : 'neutral'"
          @click="statusFilter = 'inactive'"
        >
          Non-Aktif
        </UButton>
      </div>
    </div>

    <!-- Error Alert -->
    <UAlert
      v-if="errorMessage"
      color="error"
      variant="subtle"
      title="Gagal Memuat Data"
      :description="errorMessage"
      icon="i-heroicons-exclamation-triangle"
      class="bg-red-50 dark:bg-red-950/80 border border-red-200 dark:border-red-800 text-red-900 dark:text-red-200"
    />

    <!-- Loading State -->
    <div v-if="isLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <UCard v-for="n in 3" :key="n" class="animate-pulse">
        <div class="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3"></div>
        <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
        <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-6"></div>
        <div class="h-8 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
      </UCard>
    </div>

    <!-- Empty State -->
    <UCard v-else-if="filteredSurveys.length === 0" class="p-12 text-center border border-dashed border-gray-300 dark:border-gray-700">
      <div class="max-w-md mx-auto space-y-4">
        <UIcon name="i-heroicons-document-magnifying-glass" class="w-16 h-16 text-gray-400 mx-auto" />
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
          {{ searchQuery || statusFilter !== 'all' ? 'Tidak ada survei yang cocok' : 'Belum Ada Survei' }}
        </h3>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          {{ searchQuery || statusFilter !== 'all' ? 'Coba ubah kata kunci pencarian atau filter status Anda.' : 'Anda belum membuat survei apa pun. Mulai buat survei pertama Anda sekarang!' }}
        </p>
        <div v-if="!searchQuery && statusFilter === 'all'" class="pt-2">
          <NuxtLink to="/admin/survey/create">
            <UButton color="primary" icon="i-heroicons-plus">
              Buat Survei Pertama
            </UButton>
          </NuxtLink>
        </div>
      </div>
    </UCard>

    <!-- Survey Cards Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <UCard
        v-for="survey in filteredSurveys"
        :key="survey.id"
        class="flex flex-col justify-between hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-800"
      >
        <div>
          <!-- Card Header: Title & Status Badge -->
          <div class="flex items-start justify-between gap-2 mb-3">
            <h3 class="text-lg font-bold text-gray-900 dark:text-white line-clamp-1" :title="survey.title">
              {{ survey.title }}
            </h3>
            <UBadge
              :color="survey.is_active ? 'success' : 'neutral'"
              variant="subtle"
              size="xs"
              class="shrink-0"
            >
              {{ survey.is_active ? 'Aktif' : 'Non-Aktif' }}
            </UBadge>
          </div>

          <!-- Description -->
          <p class="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-4 min-h-[2.5rem]">
            {{ survey.description || 'Tidak ada deskripsi' }}
          </p>

          <!-- Status Toggle Switch -->
          <div class="flex items-center justify-between py-2 border-t border-b border-gray-100 dark:border-gray-800/80 my-3">
            <span class="text-xs font-medium text-gray-600 dark:text-gray-400">Status Survei</span>
            <div class="flex items-center space-x-2">
              <span class="text-xs text-gray-500">{{ survey.is_active ? 'Publik' : 'Draft' }}</span>
              <UToggle
                :model-value="survey.is_active"
                @update:model-value="(val: boolean) => handleToggleStatus(survey, val)"
              />
            </div>
          </div>

          <!-- Metadata Stats -->
          <div class="grid grid-cols-2 gap-2 text-xs text-gray-500 dark:text-gray-400 mb-4">
            <div class="flex items-center">
              <UIcon name="i-heroicons-rectangle-stack" class="w-4 h-4 mr-1 text-gray-400" />
              <span>{{ survey.section_count ?? 0 }} Section</span>
            </div>
            <div class="flex items-center">
              <UIcon name="i-heroicons-inbox-stack" class="w-4 h-4 mr-1 text-gray-400" />
              <span>{{ survey.response_count ?? 0 }} Respon</span>
            </div>
            <div class="col-span-2 flex items-center text-[11px] text-gray-400">
              <UIcon name="i-heroicons-calendar" class="w-3.5 h-3.5 mr-1" />
              <span>Dibuat: {{ formatDate(survey.created_at) }}</span>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-1">
          <NuxtLink :to="`/admin/survey/${survey.id}/edit`" class="flex-1">
            <UButton color="primary" variant="subtle" size="xs" block icon="i-heroicons-wrench-screwdriver">
              Builder
            </UButton>
          </NuxtLink>

          <UButton
            color="info"
            variant="ghost"
            size="xs"
            icon="i-heroicons-share"
            title="Bagikan Survei & QR Code"
            @click="openShareModal(survey)"
          />

          <NuxtLink :to="`/admin/survey/${survey.id}/analytics`">
            <UButton color="neutral" variant="ghost" size="xs" icon="i-heroicons-chart-bar" title="Analisis" />
          </NuxtLink>

          <NuxtLink :to="`/admin/survey/${survey.id}/responses`">
            <UButton color="neutral" variant="ghost" size="xs" icon="i-heroicons-inbox" title="Detail Respon" />
          </NuxtLink>

          <UButton
            color="error"
            variant="ghost"
            size="xs"
            icon="i-heroicons-trash"
            title="Hapus Survei"
            @click="confirmDeleteSurvey(survey)"
          />
        </div>
      </UCard>
    </div>

    <!-- Share & QR Modal -->
    <ShareSurveyModal
      v-model:open="isShareModalOpen"
      :survey="shareSurveyTarget"
    />

    <!-- Delete Confirmation Modal -->
    <UModal v-model:open="isDeleteModalOpen" title="Hapus Survei">
      <template #content>
        <div class="p-6 space-y-4">
          <div class="flex items-center space-x-3 text-red-600 dark:text-red-400">
            <UIcon name="i-heroicons-exclamation-triangle" class="w-8 h-8 shrink-0" />
            <div>
              <h3 class="text-base font-semibold text-gray-900 dark:text-white">
                Konfirmasi Hapus Survei
              </h3>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>
          </div>
          <p class="text-sm text-gray-700 dark:text-gray-300">
            Apakah Anda yakin ingin menghapus survei <strong class="text-gray-900 dark:text-white">"{{ surveyToDelete?.title }}"</strong>? Semua section, pertanyaan, dan respon terkait akan dihapus secara permanen.
          </p>
          <div class="flex items-center justify-end space-x-3 pt-4 border-t border-gray-100 dark:border-gray-800">
            <UButton color="neutral" variant="ghost" :disabled="isDeleting" @click="isDeleteModalOpen = false">
              Batal
            </UButton>
            <UButton color="error" icon="i-heroicons-trash" :loading="isDeleting" @click="executeDeleteSurvey">
              Ya, Hapus Survei
            </UButton>
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import type { SurveyWithStats } from '~/composables/useSurveys'
import ShareSurveyModal from '~/components/survey/ShareSurveyModal.vue'

definePageMeta({
  middleware: 'auth',
})

const user = useSupabaseUser()
const { fetchSurveys, toggleSurveyStatus, deleteSurvey } = useSurveys()
const toast = useToast?.()

const surveys = ref<SurveyWithStats[]>([])
const isLoading = ref(true)
const errorMessage = ref('')

const searchQuery = ref('')
const statusFilter = ref<'all' | 'active' | 'inactive'>('all')

const isShareModalOpen = ref(false)
const shareSurveyTarget = ref<SurveyWithStats | null>(null)

function openShareModal(survey: SurveyWithStats) {
  shareSurveyTarget.value = survey
  isShareModalOpen.value = true
}

const isDeleteModalOpen = ref(false)
const surveyToDelete = ref<SurveyWithStats | null>(null)
const isDeleting = ref(false)

onMounted(() => {
  loadSurveys()
})

async function loadSurveys() {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const { surveys: data, error } = await fetchSurveys()

    if (error) {
      errorMessage.value = error
    } else {
      surveys.value = data
    }
  } catch (err: unknown) {
    errorMessage.value = err instanceof Error ? err.message : 'Terjadi kesalahan saat memuat survei.'
  } finally {
    isLoading.value = false
  }
}

const filteredSurveys = computed(() => {
  return surveys.value.filter((s) => {
    const matchesSearch = searchQuery.value.trim() === '' ||
      s.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      (s.description && s.description.toLowerCase().includes(searchQuery.value.toLowerCase()))

    const matchesStatus = statusFilter.value === 'all' ||
      (statusFilter.value === 'active' && s.is_active) ||
      (statusFilter.value === 'inactive' && !s.is_active)

    return matchesSearch && matchesStatus
  })
})

async function handleToggleStatus(survey: SurveyWithStats, newStatus: boolean) {
  const previousStatus = survey.is_active
  survey.is_active = newStatus

  const { success, error } = await toggleSurveyStatus(survey.id, newStatus)

  if (!success) {
    survey.is_active = previousStatus
    if (toast) {
      toast.add({
        title: 'Gagal Memperbarui Status',
        description: error || 'Terjadi kesalahan saat mengedit status.',
        color: 'error',
      })
    }
  } else if (toast) {
    toast.add({
      title: 'Status Diperbarui',
      description: `Survei "${survey.title}" sekarang ${newStatus ? 'Aktif (Publik)' : 'Non-Aktif (Draft)'}.`,
      color: 'success',
    })
  }
}

function confirmDeleteSurvey(survey: SurveyWithStats) {
  surveyToDelete.value = survey
  isDeleteModalOpen.value = true
}

async function executeDeleteSurvey() {
  if (!surveyToDelete.value) return

  isDeleting.value = true
  const targetId = surveyToDelete.value.id
  const targetTitle = surveyToDelete.value.title

  const { success, error } = await deleteSurvey(targetId)

  if (success) {
    surveys.value = surveys.value.filter((s) => s.id !== targetId)
    isDeleteModalOpen.value = false
    surveyToDelete.value = null
    if (toast) {
      toast.add({
        title: 'Survei Dihapus',
        description: `Survei "${targetTitle}" telah berhasil dihapus.`,
        color: 'success',
      })
    }
  } else if (toast) {
    toast.add({
      title: 'Gagal Menghapus Survei',
      description: error || 'Terjadi kesalahan saat menghapus survei.',
      color: 'error',
    })
  }

  isDeleting.value = false
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return dateStr
  }
}
</script>
