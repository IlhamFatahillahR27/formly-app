<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
    <!-- Header Title & Action -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-5">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          Admin Dashboard
        </h1>
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Kelola survei, analisis grafik respon, dan visual canvas flow.
        </p>
      </div>

      <NuxtLink to="/admin/survey/create">
        <UButton
          color="primary"
          icon="i-heroicons-plus"
          size="md"
        >
          Buat Survei Baru
        </UButton>
      </NuxtLink>
    </div>

    <!-- User Welcome Card -->
    <div class="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-xl p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div class="space-y-1">
        <h2 class="text-base font-semibold">
          Selamat datang, {{ user?.email || 'Admin' }}
        </h2>
        <p class="text-xs text-slate-300">
          Status Autentikasi: Terverifikasi (Session Active)
        </p>
      </div>

      <UBadge color="success" variant="solid" size="sm">
        Session Active
      </UBadge>
    </div>

    <!-- Search & Filter Bar -->
    <div class="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800">
      <div class="w-full sm:w-80">
        <UInput
          v-model="searchQuery"
          icon="i-heroicons-magnifying-glass"
          placeholder="Cari berdasarkan judul survei..."
          clearable
        />
      </div>

      <div class="flex items-center space-x-2">
        <span class="text-xs text-gray-500 dark:text-gray-400">Filter Status:</span>
        <div class="inline-flex rounded-lg bg-gray-100 dark:bg-gray-800 p-1">
          <button
            type="button"
            class="px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer"
            :class="statusFilter === 'all' ? 'bg-primary-500 text-white shadow-xs' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'"
            @click="statusFilter = 'all'"
          >
            Semua ({{ surveys.length }})
          </button>
          <button
            type="button"
            class="px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer"
            :class="statusFilter === 'active' ? 'bg-primary-500 text-white shadow-xs' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'"
            @click="statusFilter = 'active'"
          >
            Aktif
          </button>
          <button
            type="button"
            class="px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer"
            :class="statusFilter === 'inactive' ? 'bg-primary-500 text-white shadow-xs' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'"
            @click="statusFilter = 'inactive'"
          >
            Non-Aktif
          </button>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      <UCard v-for="i in 6" :key="i" class="p-4 space-y-3">
        <USkeleton class="h-6 w-3/4" />
        <USkeleton class="h-4 w-1/2" />
        <USkeleton class="h-10 w-full" />
      </UCard>
    </div>

    <!-- Error Alert -->
    <UAlert
      v-else-if="errorMessage"
      color="error"
      variant="soft"
      icon="i-heroicons-exclamation-triangle"
      title="Gagal Memuat Survei"
      :description="errorMessage"
    />

    <!-- Empty State -->
    <div
      v-else-if="filteredSurveys.length === 0"
      class="p-12 text-center bg-white dark:bg-gray-900 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 space-y-3"
    >
      <UIcon name="i-heroicons-document-magnifying-glass" class="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto" />
      <h3 class="text-base font-medium text-gray-900 dark:text-white">
        Survei tidak ditemukan
      </h3>
      <p class="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
        {{ searchQuery ? 'Tidak ada survei yang cocok dengan kueri pencarian.' : 'Belum ada survei yang dibuat. Klik tombol Buat Survei Baru untuk memulai.' }}
      </p>
      <NuxtLink v-if="!searchQuery" to="/admin/survey/create">
        <UButton color="primary" icon="i-heroicons-plus" size="xs">
          Buat Survei Pertama
        </UButton>
      </NuxtLink>
    </div>

    <!-- Survey Cards Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      <UCard
        v-for="survey in filteredSurveys"
        :key="survey.id"
        class="flex flex-col justify-between hover:shadow-md transition-all border border-gray-200 dark:border-gray-800"
      >
        <div>
          <!-- Card Header & Status Badge -->
          <div class="flex items-start justify-between gap-2 mb-2">
            <h3 class="text-base font-bold text-gray-900 dark:text-white line-clamp-1">
              {{ survey.title }}
            </h3>
            <UBadge
              :color="survey.is_active ? 'success' : 'neutral'"
              variant="soft"
              size="sm"
              class="shrink-0"
            >
              {{ survey.is_active ? 'Aktif' : 'Non-Aktif' }}
            </UBadge>
          </div>

          <p class="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 min-h-[32px] mb-3">
            {{ survey.description || 'Tidak ada deskripsi' }}
          </p>

          <!-- Interactive Status Toggle Switch -->
          <div class="flex items-center justify-between py-2 border-t border-b border-gray-100 dark:border-gray-800/80 my-3">
            <span class="text-xs font-medium text-gray-600 dark:text-gray-400">Status Publikasi</span>
            <div class="flex items-center space-x-2">
              <USwitch
                :model-value="survey.is_active"
                size="sm"
                color="primary"
                @update:model-value="(val: boolean) => handleToggleStatus(survey, val)"
              />
              <button
                type="button"
                class="text-xs font-medium cursor-pointer transition-colors"
                :class="survey.is_active ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400'"
                @click="handleToggleStatus(survey, !survey.is_active)"
              >
                {{ survey.is_active ? 'Publik' : 'Draft' }}
              </button>
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
import { ref, computed, onMounted } from 'vue'
import { useSurveys, type SurveyWithStats } from '~/composables/useSurveys'
import ShareSurveyModal from '~/components/survey/ShareSurveyModal.vue'

definePageMeta({
  middleware: 'auth',
})

const user = useSupabaseUser()
const { fetchSurveys, toggleSurveyStatus, deleteSurvey } = useSurveys()
const toast = useToast()

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
    toast.add({
      title: 'Gagal Memperbarui Status',
      description: error || 'Terjadi kesalahan saat mengedit status.',
      color: 'error',
    })
  } else {
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
    toast.add({
      title: 'Survei Dihapus',
      description: `Survei "${targetTitle}" telah berhasil dihapus.`,
      color: 'success',
    })
  } else {
    toast.add({
      title: 'Gagal Menghapus Survei',
      description: error || 'Terjadi kesalahan saat menghapus survei.',
      color: 'error',
    })
  }

  isDeleting.value = false
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '-'
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
