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
          <span>Laporan Analisis Survei</span>
        </h1>
        <p v-if="analyticsData?.survey" class="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Survei: <strong class="text-gray-800 dark:text-gray-200">{{ analyticsData.survey.title }}</strong>
        </p>
      </div>

      <div class="flex items-center gap-2">
        <NuxtLink :to="`/admin/survey/${surveyId}/responses`">
          <UButton color="neutral" variant="outline" icon="i-heroicons-inbox">
            Detail Respon
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

    <!-- Loading State -->
    <div v-if="isLoading" class="space-y-6">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <UCard v-for="i in 4" :key="i" class="p-4">
          <USkeleton class="h-10 w-full" />
        </UCard>
      </div>
      <UCard class="p-6">
        <USkeleton class="h-64 w-full" />
      </UCard>
    </div>

    <!-- Error Alert -->
    <UAlert
      v-else-if="errorMessage"
      color="error"
      variant="soft"
      icon="i-heroicons-exclamation-triangle"
      title="Gagal Memuat Analitik"
      :description="errorMessage"
    />

    <!-- Analytics Dashboard View -->
    <template v-else-if="analyticsData">
      <!-- High Level Stat KPI Cards Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Card 1: Total Responses -->
        <UCard class="p-4">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 shrink-0 flex items-center justify-center rounded-xl bg-primary-500/10 text-primary-600 dark:bg-primary-500/20 dark:text-primary-400">
              <UIcon name="i-heroicons-users" class="w-6 h-6" />
            </div>
            <div>
              <p class="text-xs font-medium text-gray-500 dark:text-gray-400">Total Responden</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">
                {{ analyticsData.totalResponses }}
              </p>
            </div>
          </div>
        </UCard>

        <!-- Card 2: Total Questions & Sections -->
        <UCard class="p-4">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 shrink-0 flex items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400">
              <UIcon name="i-heroicons-document-text" class="w-6 h-6" />
            </div>
            <div>
              <p class="text-xs font-medium text-gray-500 dark:text-gray-400">Total Pertanyaan</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">
                {{ analyticsData.totalQuestions }}
                <span class="text-xs font-normal text-gray-500">({{ analyticsData.sections.length }} Section)</span>
              </p>
            </div>
          </div>
        </UCard>

        <!-- Card 3: Overall Rating -->
        <UCard class="p-4">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 shrink-0 flex items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
              <UIcon name="i-heroicons-star" class="w-6 h-6" />
            </div>
            <div>
              <p class="text-xs font-medium text-gray-500 dark:text-gray-400">Rata-rata Rating Survei</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">
                <template v-if="analyticsData.averageRatingOverall !== null">
                  {{ analyticsData.averageRatingOverall }} <span class="text-xs font-normal text-amber-500">★</span>
                </template>
                <template v-else>
                  <span class="text-sm font-normal text-gray-400">-</span>
                </template>
              </p>
            </div>
          </div>
        </UCard>

        <!-- Card 4: Latest Submission -->
        <UCard class="p-4">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 shrink-0 flex items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
              <UIcon name="i-heroicons-clock" class="w-6 h-6" />
            </div>
            <div>
              <p class="text-xs font-medium text-gray-500 dark:text-gray-400">Respon Terakhir</p>
              <p class="text-sm font-semibold text-gray-900 dark:text-white">
                {{ formattedLatestSubmission }}
              </p>
            </div>
          </div>
        </UCard>
      </div>

      <!-- Empty Responses Alert -->
      <UCard
        v-if="analyticsData.totalResponses === 0"
        class="p-8 text-center border border-dashed border-gray-300 dark:border-gray-700"
      >
        <UIcon name="i-heroicons-inbox" class="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-3" />
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
          Belum Ada Data Respon
        </h2>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-md mx-auto">
          Survei ini belum menerima pengisian dari pengguna. Bagikan link survei atau buka pratinjau untuk mencoba pengisian.
        </p>
      </UCard>

      <!-- Question Analytics Grouped by Section -->
      <div v-else class="space-y-8">
        <h2 class="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <UIcon name="i-heroicons-chart-pie" class="w-5 h-5 text-primary-500" />
          <span>Statistik Hasil Per Section</span>
        </h2>

        <!-- Section Groups Loop -->
        <div
          v-for="group in sectionSummaryGroups"
          :key="group.section.id"
          class="space-y-4"
        >
          <!-- Section Header Card Banner -->
          <div class="bg-primary-50/70 dark:bg-primary-950/30 border border-primary-200/70 dark:border-primary-900/50 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div class="space-y-1">
              <div class="flex items-center gap-2">
                <UBadge color="primary" variant="solid" size="sm">
                  Section {{ group.sectionIndex }}
                </UBadge>
                <h3 class="text-base font-bold text-gray-900 dark:text-white">
                  {{ group.section.title }}
                </h3>
              </div>
              <p v-if="group.section.description" class="text-xs text-gray-600 dark:text-gray-400">
                {{ group.section.description }}
              </p>
            </div>
            <UBadge color="neutral" variant="subtle" size="sm" class="self-start sm:self-center">
              {{ group.questionCount }} Pertanyaan
            </UBadge>
          </div>

          <!-- Section Summary Highlight Box -->
          <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 shadow-2xs">
            <div class="flex items-center gap-2 mb-3">
              <UIcon name="i-heroicons-sparkles" class="w-4 h-4 text-amber-500" />
              <h4 class="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                Ringkasan Analisis Section {{ group.sectionIndex }}
              </h4>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <!-- Metric 1: Section Rating Average -->
              <div class="p-3 bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 rounded-lg flex items-center gap-3">
                <div class="w-10 h-10 shrink-0 rounded-lg bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 flex items-center justify-center">
                  <UIcon name="i-heroicons-star" class="w-5 h-5" />
                </div>
                <div>
                  <p class="text-[11px] font-medium text-gray-500 dark:text-gray-400">Rata-rata Rating Section</p>
                  <template v-if="group.ratingAverage !== null">
                    <p class="text-base font-bold text-amber-600 dark:text-amber-400 flex items-baseline gap-1">
                      <span>{{ group.ratingAverage }}</span>
                      <span class="text-xs text-gray-400 font-normal">/ {{ group.ratingMaxScale }} ★</span>
                    </p>
                    <p class="text-[10px] text-gray-500">
                      (dari {{ group.ratingCount }} respon rating)
                    </p>
                  </template>
                  <template v-else>
                    <p class="text-xs text-gray-400 italic">Tidak ada pertanyaan rating</p>
                  </template>
                </div>
              </div>

              <!-- Metric 2: Top Choice Option -->
              <div class="p-3 bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-200/60 dark:border-indigo-900/40 rounded-lg flex items-center gap-3">
                <div class="w-10 h-10 shrink-0 rounded-lg bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400 flex items-center justify-center">
                  <UIcon name="i-heroicons-trophy" class="w-5 h-5" />
                </div>
                <div class="truncate">
                  <p class="text-[11px] font-medium text-gray-500 dark:text-gray-400">Opsi Terbanyak Dipilih</p>
                  <template v-if="group.topChoice">
                    <p class="text-sm font-bold text-indigo-600 dark:text-indigo-400 truncate" :title="group.topChoice.label">
                      "{{ group.topChoice.label }}"
                    </p>
                    <p class="text-[10px] text-gray-500">
                      {{ group.topChoice.percentage }}% ({{ group.topChoice.count }} pemilih)
                    </p>
                  </template>
                  <template v-else>
                    <p class="text-xs text-gray-400 italic">Tidak ada pilihan ganda</p>
                  </template>
                </div>
              </div>

              <!-- Metric 3: Total Section Participation -->
              <div class="p-3 bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 rounded-lg flex items-center gap-3">
                <div class="w-10 h-10 shrink-0 rounded-lg bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 flex items-center justify-center">
                  <UIcon name="i-heroicons-chart-bar" class="w-5 h-5" />
                </div>
                <div>
                  <p class="text-[11px] font-medium text-gray-500 dark:text-gray-400">Aktivitas Jawaban Section</p>
                  <p class="text-base font-bold text-emerald-600 dark:text-emerald-400">
                    {{ group.totalAnswersCount }} Jawaban
                  </p>
                  <p class="text-[10px] text-gray-500">
                    {{ group.textResponseCount > 0 ? `${group.textResponseCount} masukan isian teks` : 'Semua pertanyaan terstruktur' }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Section Questions Cards -->
          <div
            v-for="(qa, qIdx) in group.questionAnalyticsList"
            :key="qa.question.id"
            class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 shadow-2xs space-y-4"
          >
            <!-- Question Title & Metadata Header -->
            <div class="flex items-start justify-between gap-4 border-b border-gray-100 dark:border-gray-800 pb-3">
              <div>
                <div class="flex items-center gap-2 mb-1">
                  <span class="text-xs font-semibold text-gray-500">
                    Pertanyaan #{{ getGlobalQuestionIndex(qa.question.id) }}
                  </span>
                  <UBadge color="neutral" variant="subtle" size="sm">
                    {{ formatQuestionType(qa.question.type) }}
                  </UBadge>
                  <span v-if="qa.question.is_required" class="text-xs text-rose-500 font-medium">Wajib</span>
                </div>
                <h4 class="text-base font-semibold text-gray-900 dark:text-white">
                  {{ qa.question.question_text }}
                </h4>
              </div>
              <div class="text-xs text-gray-500 dark:text-gray-400">
                <span class="font-bold text-gray-900 dark:text-white">{{ qa.totalAnswers }}</span> jawaban
              </div>
            </div>

            <!-- 1. Multiple Choice Visualization -->
            <template v-if="qa.question.type === 'multiple_choice'">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <!-- Pie Chart -->
                <div class="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-2 flex items-center justify-center">
                  <AnalyticsChartPie
                    :labels="qa.choiceStats?.map(c => c.label) || []"
                    :data="qa.choiceStats?.map(c => c.count) || []"
                  />
                </div>

                <!-- Choice Breakdown Table -->
                <div class="space-y-3">
                  <h5 class="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Rincian Jawaban
                  </h5>
                  <div class="space-y-2">
                    <div
                      v-for="stat in qa.choiceStats"
                      :key="stat.label"
                      class="space-y-1"
                    >
                      <div class="flex justify-between text-xs font-medium">
                        <span class="text-gray-800 dark:text-gray-200">{{ stat.label }}</span>
                        <span class="text-gray-500">{{ stat.count }} ({{ stat.percentage }}%)</span>
                      </div>
                      <div class="w-full bg-gray-100 dark:bg-gray-800 h-2 rounded-full overflow-hidden">
                        <div
                          class="bg-primary-500 h-full rounded-full transition-all duration-300"
                          :style="{ width: `${stat.percentage}%` }"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </template>

            <!-- 2. Rating Visualization -->
            <template v-else-if="qa.question.type === 'rating'">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <!-- Average Rating Card & Star Display -->
                <div class="flex flex-col items-center justify-center p-6 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/30 rounded-lg text-center space-y-2">
                  <p class="text-xs font-semibold text-amber-700 dark:text-amber-400">Rata-rata Skor Rating</p>
                  <div class="text-4xl font-extrabold text-amber-600 dark:text-amber-400 flex items-baseline justify-center gap-1">
                    <span>{{ qa.averageRating }}</span>
                    <span class="text-lg text-gray-400 dark:text-gray-500">/ {{ qa.maxRating }}</span>
                  </div>
                  <div class="flex items-center gap-1 text-amber-400 pt-1">
                    <UIcon
                      v-for="star in (qa.maxRating || 5)"
                      :key="star"
                      :name="star <= Math.round(qa.averageRating || 0) ? 'i-heroicons-star-solid' : 'i-heroicons-star'"
                      class="w-5 h-5"
                    />
                  </div>
                </div>

                <!-- Rating Distribution Bar Chart -->
                <div class="space-y-2">
                  <h5 class="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Distribusional Bintang
                  </h5>
                  <AnalyticsChartBar
                    :labels="Object.keys(qa.ratingDistribution || {}).map(k => `${k} Bintang`)"
                    :data="Object.values(qa.ratingDistribution || {})"
                  />
                </div>
              </div>
            </template>

            <!-- 3. Short & Long Text Visualization -->
            <template v-else-if="qa.question.type === 'short_text' || qa.question.type === 'long_text'">
              <div class="space-y-3">
                <div class="flex items-center justify-between">
                  <h5 class="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Daftar Jawaban Responden ({{ qa.textResponses?.length || 0 }})
                  </h5>
                </div>

                <div v-if="qa.textResponses && qa.textResponses.length > 0" class="space-y-2 max-h-60 overflow-y-auto pr-1">
                  <div
                    v-for="(item, tIdx) in qa.textResponses"
                    :key="tIdx"
                    class="p-3 bg-gray-50 dark:bg-gray-800/60 rounded-lg text-xs text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-gray-800 flex justify-between gap-4"
                  >
                    <span>"{{ item.value }}"</span>
                    <span class="text-[10px] text-gray-400 shrink-0">{{ formatDate(item.submittedAt) }}</span>
                  </div>
                </div>

                <div v-else class="p-4 text-center bg-gray-50 dark:bg-gray-800/40 rounded-lg text-xs text-gray-400 italic">
                  Belum ada isian teks dari responden.
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import {
  useSurveyAnalytics,
  formatFriendlyDate,
  type AnalyticsSummary,
  type SectionAnalyticsSummary,
} from '~/composables/useSurveyAnalytics'
import AnalyticsChartPie from '~/components/analytics/ChartPie.vue'
import AnalyticsChartBar from '~/components/analytics/ChartBar.vue'
import { ref, shallowRef, computed, onMounted } from 'vue'

definePageMeta({
  middleware: 'auth',
})

const route = useRoute()
const toast = useToast()
const surveyId = computed(() => String(route.params.id))

const { fetchAnalytics, exportToCSV } = useSurveyAnalytics()

const isLoading = ref(true)
const isExporting = ref(false)
const errorMessage = ref<string | null>(null)
const analyticsData = shallowRef<AnalyticsSummary | null>(null)

const formattedLatestSubmission = computed<string>(() => {
  if (!analyticsData.value?.latestSubmission) return '-'
  return formatFriendlyDate(analyticsData.value.latestSubmission)
})

/**
 * Section Summary groups provided directly by useSurveyAnalytics
 */
const sectionSummaryGroups = computed<SectionAnalyticsSummary[]>(() => {
  return analyticsData.value?.sectionSummaries || []
})

function getGlobalQuestionIndex(questionId: string): number {
  if (!analyticsData.value?.questions) return 1
  const idx = analyticsData.value.questions.findIndex((q) => q.id === questionId)
  return idx !== -1 ? idx + 1 : 1
}

function formatQuestionType(type: string): string {
  switch (type) {
    case 'short_text': return 'Isian Singkat'
    case 'long_text': return 'Isian Panjang'
    case 'multiple_choice': return 'Pilihan Ganda'
    case 'rating': return 'Skala Rating'
    default: return type
  }
}

function formatDate(dateStr: string): string {
  return formatFriendlyDate(dateStr)
}

async function loadData() {
  isLoading.value = true
  errorMessage.value = null

  const { data, error } = await fetchAnalytics(surveyId.value)
  if (error || !data) {
    errorMessage.value = error || 'Gagal memuat data analitik.'
  } else {
    analyticsData.value = data
  }

  isLoading.value = false
}

async function handleExportCSV() {
  if (!surveyId.value) return
  isExporting.value = true

  const { success, error } = await exportToCSV(
    surveyId.value,
    analyticsData.value?.survey.title || 'survei'
  )

  if (success) {
    toast.add({
      title: 'Berhasil Ekspor CSV',
      description: 'File CSV analitik survei berhasil diunduh.',
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
