<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
    <!-- Top Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-5">
      <div>
        <NuxtLink to="/admin/dashboard" class="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mb-2 transition-colors">
          <UIcon name="i-heroicons-arrow-left" class="w-4 h-4 mr-1" />
          Kembali ke Dashboard
        </NuxtLink>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <span>Detail Respon Survei</span>
        </h1>
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Tabel riwayat pengisian responden, inspeksi jawaban individual, dan ekspor CSV.
        </p>
      </div>

      <div class="flex items-center gap-2">
        <NuxtLink :to="`/admin/survey/${surveyId}/analytics`">
          <UButton color="neutral" variant="outline" icon="i-heroicons-chart-pie">
            Grafik Analytics
          </UButton>
        </NuxtLink>
        <UButton
          color="primary"
          icon="i-heroicons-arrow-down-tray"
          :loading="isExporting"
          @click="handleExportCSV"
        >
          Export CSV
        </UButton>
      </div>
    </div>

    <!-- Filter & Search Controls -->
    <div class="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800">
      <div class="w-full sm:w-80">
        <UInput
          v-model="searchQuery"
          icon="i-heroicons-magnifying-glass"
          placeholder="Cari ID respon atau jawaban..."
          clearable
        />
      </div>
      <div class="text-xs text-gray-500 dark:text-gray-400">
        Menampilkan <span class="font-bold text-gray-900 dark:text-white">{{ filteredResponses.length }}</span> dari {{ responsesList.length }} respon
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="space-y-4">
      <UCard v-for="i in 5" :key="i" class="p-4">
        <USkeleton class="h-6 w-full" />
      </UCard>
    </div>

    <!-- Error Alert -->
    <UAlert
      v-else-if="errorMessage"
      color="error"
      variant="soft"
      icon="i-heroicons-exclamation-triangle"
      title="Gagal Memuat Respon"
      :description="errorMessage"
    />

    <!-- Response Table Grid -->
    <template v-else>
      <UCard v-if="filteredResponses.length > 0" class="overflow-hidden p-0">
        <UTable
          :data="paginatedResponses"
          :columns="columns"
        >
          <!-- Nuxt UI v3 slot format: #<accessorKey>-cell -->
          <!-- Custom Column: Response ID -->
          <template #responseId-cell="{ row }">
            <span class="font-mono text-xs font-semibold text-primary-600 dark:text-primary-400">
              #{{ (row.original?.responseId || row.responseId || '').slice(0, 8) }}
            </span>
          </template>

          <!-- Custom Column: Submitted At -->
          <template #submittedAt-cell="{ row }">
            <span class="text-xs text-gray-600 dark:text-gray-300">
              {{ formatDate(row.original?.submittedAt || row.submittedAt) }}
            </span>
          </template>

          <!-- Custom Column: Answers Count -->
          <template #answersCount-cell="{ row }">
            <UBadge color="neutral" variant="subtle" size="sm">
              {{ row.original?.answersCount ?? row.answersCount }} Jawaban
            </UBadge>
          </template>

          <!-- Custom Column: Action -->
          <template #actions-cell="{ row }">
            <UButton
              color="primary"
              variant="subtle"
              size="xs"
              icon="i-heroicons-eye"
              @click="openDetailModal(row.original || row)"
            >
              Lihat Detail
            </UButton>
          </template>

          <!-- Fallback slot names for backward compatibility -->
          <template #responseId-data="{ row }">
            <span class="font-mono text-xs font-semibold text-primary-600 dark:text-primary-400">
              #{{ (row.responseId || '').slice(0, 8) }}
            </span>
          </template>
          <template #submittedAt-data="{ row }">
            <span class="text-xs text-gray-600 dark:text-gray-300">
              {{ formatDate(row.submittedAt) }}
            </span>
          </template>
          <template #answersCount-data="{ row }">
            <UBadge color="neutral" variant="subtle" size="sm">
              {{ row.answersCount }} Jawaban
            </UBadge>
          </template>
          <template #actions-data="{ row }">
            <UButton
              color="primary"
              variant="subtle"
              size="xs"
              icon="i-heroicons-eye"
              @click="openDetailModal(row)"
            >
              Lihat Detail
            </UButton>
          </template>
        </UTable>

        <!-- Pagination Bar -->
        <div v-if="totalPages > 1" class="flex justify-between items-center px-4 py-3 border-t border-gray-200 dark:border-gray-800">
          <span class="text-xs text-gray-500">
            Halaman {{ currentPage }} dari {{ totalPages }}
          </span>
          <UPagination
            v-model:page="currentPage"
            :total="filteredResponses.length"
            :items-per-page="itemsPerPage"
          />
        </div>
      </UCard>

      <!-- Empty State -->
      <UCard
        v-else
        class="p-8 text-center border border-dashed border-gray-300 dark:border-gray-700"
      >
        <UIcon name="i-heroicons-inbox" class="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-3" />
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
          {{ searchQuery ? 'Tidak Ada Hasil Pencarian' : 'Belum Ada Respon' }}
        </h2>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-md mx-auto">
          {{ searchQuery ? 'Coba sesuaikan kata kunci pencarian Anda.' : 'Survei ini belum menerima pengisian jawaban dari pengguna.' }}
        </p>
      </UCard>
    </template>

    <!-- Response Detail Modal -->
    <UModal
      v-model:open="isModalOpen"
      :title="`Detail Respon (#${(selectedResponse?.responseId || '').slice(0, 8)})`"
    >
      <template #content>
        <div v-if="selectedResponse" class="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          <!-- Response Header Metadata & Close Action -->
          <div class="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-gray-500 dark:text-gray-400">
            <div class="space-y-1">
              <p><strong class="text-gray-800 dark:text-gray-200">Full Response ID:</strong> <span class="font-mono text-primary-600 dark:text-primary-400">{{ selectedResponse.responseId }}</span></p>
              <p><strong class="text-gray-800 dark:text-gray-200">Waktu Submit:</strong> {{ formatDate(selectedResponse.submittedAt) }}</p>
            </div>
            <div class="flex items-center gap-2 self-start sm:self-center">
              <UBadge color="neutral" variant="subtle" size="sm">
                {{ selectedResponse.rawAnswers.length }} Jawaban Record
              </UBadge>
              <UButton
                color="neutral"
                variant="ghost"
                size="xs"
                icon="i-heroicons-x-mark"
                @click="isModalOpen = false"
              />
            </div>
          </div>

          <!-- Answer Items Grouped per Section -->
          <div class="space-y-6">
            <h3 class="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <UIcon name="i-heroicons-clipboard-document-check" class="w-4 h-4 text-primary-500" />
              <span>Daftar Jawaban Responden Per Section</span>
            </h3>

            <!-- Section Groups Loop -->
            <div
              v-for="group in groupedQuestionsForModal"
              :key="group.section.id"
              class="space-y-3"
            >
              <!-- Section Header Banner -->
              <div class="bg-primary-50/70 dark:bg-primary-950/30 border border-primary-200/70 dark:border-primary-900/50 px-3 py-2 rounded-lg flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <UBadge color="primary" variant="solid" size="xs">
                    Section {{ group.sectionIndex }}
                  </UBadge>
                  <span class="text-xs font-bold text-gray-900 dark:text-white">
                    {{ group.section.title }}
                  </span>
                </div>
                <span v-if="group.section.description" class="text-[11px] text-gray-500 dark:text-gray-400 truncate max-w-xs">
                  {{ group.section.description }}
                </span>
              </div>

              <!-- Questions inside this Section -->
              <div class="space-y-3 pl-2 sm:pl-3 border-l-2 border-primary-200 dark:border-primary-900/50">
                <div
                  v-for="item in group.questions"
                  :key="item.question.id"
                  class="border border-gray-200 dark:border-gray-800 rounded-lg p-3 space-y-2 bg-white dark:bg-gray-900"
                >
                  <div class="flex items-center justify-between text-xs text-gray-500">
                    <span class="font-semibold text-gray-700 dark:text-gray-300">
                      Pertanyaan {{ item.globalIndex }}
                    </span>
                    <UBadge color="neutral" variant="subtle" size="sm">{{ item.question.type }}</UBadge>
                  </div>
                  <p class="text-sm font-medium text-gray-900 dark:text-white">
                    {{ item.question.question_text }}
                  </p>

                  <!-- Answers for this question -->
                  <div class="pt-2 border-t border-gray-100 dark:border-gray-800 space-y-1">
                    <template v-if="selectedResponse.answersMap[item.question.id] && selectedResponse.answersMap[item.question.id].length > 0">
                      <div
                        v-for="(ansVal, aIdx) in selectedResponse.answersMap[item.question.id]"
                        :key="aIdx"
                        class="p-2 bg-gray-50 dark:bg-gray-800/80 rounded-md text-sm text-gray-800 dark:text-gray-200 flex items-center justify-between"
                      >
                        <span>{{ ansVal }}</span>
                        <span v-if="selectedResponse.answersMap[item.question.id].length > 1" class="text-[10px] text-primary-500 font-medium">
                          Iterasi {{ aIdx + 1 }}
                        </span>
                      </div>
                    </template>
                    <template v-else>
                      <span class="text-xs text-gray-400 italic">Tidak dijawab / dilewati</span>
                    </template>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Modal Footer with Explicit Close Button -->
          <div class="pt-4 border-t border-gray-200 dark:border-gray-800 flex justify-end gap-2">
            <UButton
              color="neutral"
              variant="outline"
              icon="i-heroicons-x-mark"
              @click="isModalOpen = false"
            >
              Tutup Modal
            </UButton>
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useSurveyAnalytics, formatFriendlyDate, type DetailedResponseRow, type QuestionRow, type SectionRow } from '~/composables/useSurveyAnalytics'

definePageMeta({
  middleware: 'auth',
})

const route = useRoute()
const toast = useToast()
const surveyId = computed(() => String(route.params.id))

const { fetchDetailedResponses, exportToCSV } = useSurveyAnalytics()

const isLoading = ref(true)
const isExporting = ref(false)
const errorMessage = ref<string | null>(null)
const responsesList = ref<DetailedResponseRow[]>([])
const questions = ref<QuestionRow[]>([])
const sections = ref<SectionRow[]>([])

const searchQuery = ref('')
const currentPage = ref(1)
const itemsPerPage = ref(10)

const isModalOpen = ref(false)
const selectedResponse = ref<DetailedResponseRow | null>(null)

const columns = [
  { accessorKey: 'responseId', header: 'ID Respon' },
  { accessorKey: 'submittedAt', header: 'Waktu Submit' },
  { accessorKey: 'answersCount', header: 'Jumlah Jawaban' },
  { accessorKey: 'actions', header: 'Aksi' },
]

const filteredResponses = computed(() => {
  if (!searchQuery.value || !searchQuery.value.trim()) {
    return responsesList.value
  }

  const query = searchQuery.value.toLowerCase().trim()
  return responsesList.value.filter(resp => {
    if (resp.responseId.toLowerCase().includes(query)) return true
    for (const valList of Object.values(resp.answersMap)) {
      if (valList.some(v => v.toLowerCase().includes(query))) return true
    }
    return false
  })
})

const totalPages = computed(() => Math.ceil(filteredResponses.value.length / itemsPerPage.value))

const paginatedResponses = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  return filteredResponses.value.slice(start, start + itemsPerPage.value)
})

/**
 * Group questions for modal display by section
 */
const groupedQuestionsForModal = computed(() => {
  if (!questions.value.length) return []

  const sectionMap: Record<string, QuestionRow[]> = {}
  for (const q of questions.value) {
    if (!sectionMap[q.section_id]) {
      sectionMap[q.section_id] = []
    }
    sectionMap[q.section_id].push(q)
  }

  let globalIdx = 0

  return sections.value.map((sec, secIdx) => {
    const secQuestions = sectionMap[sec.id] || []
    const questionsWithIndex = secQuestions.map(q => {
      globalIdx++
      return {
        question: q,
        globalIndex: globalIdx,
      }
    })

    return {
      section: sec,
      sectionIndex: secIdx + 1,
      questions: questionsWithIndex,
    }
  }).filter(group => group.questions.length > 0)
})

function formatDate(dateStr: string): string {
  return formatFriendlyDate(dateStr)
}

function openDetailModal(row: DetailedResponseRow) {
  selectedResponse.value = row
  isModalOpen.value = true
}

async function loadData() {
  isLoading.value = true
  errorMessage.value = null

  const { data, error } = await fetchDetailedResponses(surveyId.value)
  if (error || !data) {
    errorMessage.value = error || 'Gagal memuat daftar respon.'
  } else {
    responsesList.value = data.responses
    questions.value = data.questions
    sections.value = data.sections || []
  }

  isLoading.value = false
}

async function handleExportCSV() {
  if (!surveyId.value) return
  isExporting.value = true

  const { success, error } = await exportToCSV(surveyId.value)

  if (success) {
    toast.add({
      title: 'Berhasil Ekspor CSV',
      description: 'File CSV respon survei berhasil diunduh.',
      color: 'success',
      icon: 'i-heroicons-check-circle',
    })
  } else {
    toast.add({
      title: 'Gagal Ekspor CSV',
      description: error || 'Terjadi kesalahan saat mengekspor data.',
      color: 'error',
      icon: 'i-heroicons-exclamation-circle',
    })
  }

  isExporting.value = false
}

onMounted(() => {
  loadData()
})
</script>
