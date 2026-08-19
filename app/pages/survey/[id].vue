<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col font-sans antialiased text-gray-900 dark:text-gray-100">
    <!-- Floating Preview Banner (Only for non-demo preview) -->
    <ClientOnly>
      <PreviewBanner />
    </ClientOnly>

    <!-- Main Content Container with ClientOnly wrapper for dynamic state execution -->
    <div class="flex-1 w-full mx-auto px-3 sm:px-6 md:px-8 lg:px-4 py-4 sm:py-6 md:py-8 lg:py-12 max-w-full sm:max-w-xl md:max-w-2xl lg:max-w-3xl flex flex-col justify-center transition-all duration-300">
      <ClientOnly>
        <!-- Loading State -->
        <div v-if="isLoading" class="p-6 sm:p-8 md:p-10 lg:p-12 text-center bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
          <div class="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 aspect-square rounded-full bg-primary-50 dark:bg-primary-950/40 flex items-center justify-center mx-auto">
            <UIcon name="i-heroicons-arrow-path" class="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 aspect-square text-primary-500 animate-spin" />
          </div>
          <p class="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
            Memuat survei...
          </p>
        </div>

        <!-- Inactive Survey State Card -->
        <div v-else-if="isInactive && !isSubmitted" class="p-6 sm:p-8 md:p-10 lg:p-12 text-center bg-white dark:bg-gray-900 rounded-2xl border border-amber-200/80 dark:border-amber-900/50 shadow-sm space-y-5">
          <div class="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 aspect-square rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto shrink-0">
            <UIcon name="i-heroicons-lock-closed" class="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 aspect-square" />
          </div>

          <div class="space-y-2">
            <UBadge v-if="survey?.title" color="neutral" variant="soft" size="sm">
              {{ survey.title }}
            </UBadge>
            <h2 class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              Survei Sedang Tidak Aktif
            </h2>
            <p class="text-xs sm:text-sm text-gray-600 dark:text-gray-400 max-w-md mx-auto leading-relaxed">
              Maaf, pengisian survei ini sedang ditutup atau dinonaktifkan sementara waktu oleh pembuat survei. Silakan hubungi administrator survei jika Anda membutuhkan akses.
            </p>
          </div>

          <div class="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <UButton color="neutral" variant="outline" size="sm" icon="i-heroicons-arrow-path" class="w-full sm:w-auto" @click="reloadPage">
              Muat Ulang
            </UButton>
            <UButton color="primary" variant="solid" size="sm" icon="i-heroicons-home" to="/" class="w-full sm:w-auto">
              Kembali ke Beranda
            </UButton>
          </div>
        </div>

        <!-- Generic Error State -->
        <div v-else-if="errorMessage && !isSubmitted" class="p-6 sm:p-8 md:p-10 lg:p-12 text-center bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
          <div class="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 aspect-square rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto shrink-0">
            <UIcon name="i-heroicons-exclamation-triangle" class="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 aspect-square" />
          </div>
          <h2 class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            Survei Tidak Tersedia
          </h2>
          <p class="text-xs sm:text-sm text-gray-600 dark:text-gray-400 max-w-md mx-auto">
            {{ errorMessage }}
          </p>
          <div class="pt-2">
            <UButton color="neutral" variant="outline" size="sm" to="/" class="w-full sm:w-auto">
              Kembali ke Beranda
            </UButton>
          </div>
        </div>

        <!-- Completion / Thank You Screen -->
        <div v-else-if="isSubmitted" class="p-6 sm:p-8 md:p-10 lg:p-12 text-center bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-6">
          <div class="w-14 h-14 sm:w-16 sm:h-16 aspect-square rounded-full bg-success-100 dark:bg-success-950/60 text-success-600 dark:text-success-400 flex items-center justify-center mx-auto shrink-0">
            <UIcon name="i-heroicons-check-circle-solid" class="w-8 h-8 sm:w-10 sm:h-10 aspect-square" />
          </div>
          <div class="space-y-2">
            <h2 class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              Terima Kasih!
            </h2>
            <p class="text-xs sm:text-base text-gray-600 dark:text-gray-400 max-w-md mx-auto">
              Respon Anda telah berhasil dikirim untuk survei <strong>{{ survey?.title }}</strong>.
            </p>
          </div>
          <div v-if="isPreview || isDemo" class="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-xl text-xs text-amber-800 dark:text-amber-200">
            ✨ Ini adalah simulasi sukses Mode {{ isDemo ? 'Demo' : 'Preview' }}. Tidak ada data yang tersimpan di database Supabase.
          </div>
        </div>

        <!-- Active Survey Execution Screen -->
        <div v-else-if="survey && currentSection" class="space-y-4 sm:space-y-6">
          <!-- Survey Metadata & Section Header -->
          <div class="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
            <!-- Cover Banner (Facebook / LinkedIn Style) -->
            <div v-if="survey.cover_image_url" class="relative w-full h-36 sm:h-48 md:h-56 overflow-hidden bg-gray-100 dark:bg-gray-800">
              <img
                :src="survey.cover_image_url"
                alt="Survey Cover Header"
                class="w-full h-full object-cover"
              />
            </div>

            <div class="p-6 sm:p-8 space-y-4">
              <div>
                <div class="flex items-center justify-between">
                  <span class="text-xs font-semibold tracking-wider uppercase text-primary-600 dark:text-primary-400">
                    {{ survey.title }}
                  </span>
                  <UBadge v-if="currentIterationCount > 1" color="warning" variant="soft" size="sm">
                    Putaran Ke-{{ currentIterationCount }}
                  </UBadge>
                </div>

                <h1 class="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mt-1">
                  {{ currentSection.title }}
                </h1>
                <p v-if="currentSection.description" class="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  {{ currentSection.description }}
                </p>
              </div>

              <!-- Progress Bar -->
              <div class="pt-2">
                <div class="flex items-center justify-between text-xs text-gray-500 mb-1.5 font-medium">
                  <span>{{ stepLabel }}</span>
                  <span v-if="currentSection.is_end_section">Langkah Terakhir</span>
                  <span v-else-if="totalCategoryCount > 0 && completedCategories.length > 0" class="text-emerald-600 dark:text-emerald-400 font-semibold">
                    {{ completedCategories.length }} / {{ totalCategoryCount }} Kategori Selesai
                  </span>
                </div>
                <div class="w-full bg-gray-100 dark:bg-gray-800 h-2 rounded-full overflow-hidden">
                  <div
                    class="bg-primary-500 h-full transition-all duration-300 rounded-full"
                    :style="{ width: `${progressPercentage}%` }"
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Questions List Container -->
          <div class="space-y-4">
            <!-- Questions List -->
            <template v-if="currentQuestions.length > 0">
              <QuestionInput
                v-for="question in currentQuestions"
                :key="question.id"
                :question="question"
                :model-value="answers[question.id]"
                :error-message="validationErrors[question.id]"
                :completed-categories="completedCategories"
                @update:model-value="(val) => setAnswer(question.id, val)"
              />
            </template>

            <div v-else class="p-8 text-center bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 text-gray-500 text-sm italic">
              Tidak ada pertanyaan dalam section ini.
            </div>
          </div>

          <!-- Navigation Buttons Controls -->
          <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 pt-4">
            <UButton
              v-if="navigationHistory.length > 0"
              color="neutral"
              variant="outline"
              size="md"
              icon="i-heroicons-arrow-left"
              class="w-full sm:w-auto"
              @click="handlePrevious"
            >
              Sebelumnya
            </UButton>
            <div v-else></div>

            <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
              <UButton
                v-if="hasNextSection"
                color="primary"
                size="md"
                trailing-icon="i-heroicons-arrow-right"
                class="w-full sm:w-auto justify-center"
                @click="handleNext"
              >
                Selanjutnya
              </UButton>

              <UButton
                v-else
                color="success"
                size="md"
                icon="i-heroicons-paper-airplane"
                :loading="isSubmitting"
                class="w-full sm:w-auto justify-center"
                @click="handleSubmit"
              >
                Kirim Jawaban
              </UButton>
            </div>
          </div>
        </div>

        <template #fallback>
          <div class="p-6 sm:p-8 md:p-10 lg:p-12 text-center bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
            <div class="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 aspect-square rounded-full bg-primary-50 dark:bg-primary-950/40 flex items-center justify-center mx-auto">
              <UIcon name="i-heroicons-arrow-path" class="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 aspect-square text-primary-500 animate-spin" />
            </div>
            <p class="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
              Memuat survei...
            </p>
          </div>
        </template>
      </ClientOnly>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch, onMounted } from 'vue'
import QuestionInput from '~/components/survey/QuestionInput.vue'
import PreviewBanner from '~/components/survey/PreviewBanner.vue'

const route = useRoute()
const surveyId = computed(() => String(route.params.id || ''))
const isPreview = computed(() => route.query.preview === 'true')
const isDemo = computed(() => route.query.demo === 'true' || route.query.demo === '1')

const {
  survey,
  sections,
  allQuestions,
  currentSection,
  currentQuestions,
  answers,
  navigationHistory,
  completedCategories,
  isLoading,
  isSubmitted,
  isSubmitting,
  errorMessage,
  validationErrors,
  loadSurveyAndSections,
  setAnswer,
  getNextSectionId,
  goToNextSection,
  goToPreviousSection,
  submitSurvey,
} = useSurveyRunner()

watch(
  [surveyId, isPreview, isDemo],
  async ([newId, newPreview, newDemo]) => {
    if (newId && typeof window !== 'undefined') {
      await loadSurveyAndSections(newId, newPreview || newDemo)
    }
  },
  { immediate: true }
)

onMounted(async () => {
  if (surveyId.value) {
    await loadSurveyAndSections(surveyId.value, isPreview.value || isDemo.value)
  }
})

const isInactive = computed(() => {
  if (isPreview.value || isDemo.value) return false
  if (errorMessage.value && errorMessage.value.toLowerCase().includes('tidak aktif')) return true
  if (survey.value && !survey.value.is_active) return true
  return false
})

const hasNextSection = computed(() => {
  if (!currentSection.value) return false
  if (currentSection.value.is_end_section) return false
  const nextId = getNextSectionId(currentSection.value.id)
  return nextId !== null
})

// Calculate total categories available in category choice question
const totalCategoryCount = computed<number>(() => {
  for (const q of allQuestions.value) {
    if (q.type === 'multiple_choice' && q.options) {
      let opts: unknown[] = []
      if (Array.isArray(q.options)) opts = q.options
      else if (typeof q.options === 'string') {
        try { opts = JSON.parse(q.options) } catch {}
      }
      if (Array.isArray(opts) && opts.length > 1) {
        const hasCategories = opts.some((o: unknown) => {
          if (typeof o === 'object' && o !== null) {
            const obj = o as Record<string, unknown>
            const txt = String(obj.text || obj.label || '').trim().toLowerCase()
            return !['ya', 'tidak', 'yes', 'no'].includes(txt)
          }
          const txt = String(o).trim().toLowerCase()
          return !['ya', 'tidak', 'yes', 'no'].includes(txt)
        })
        if (hasCategories) {
          return opts.length
        }
      }
    }
  }
  return 0
})

// Calculate current section's iteration count in looping history
const currentIterationCount = computed<number>(() => {
  if (!currentSection.value) return 1
  const curId = currentSection.value.id
  return navigationHistory.value.filter((id) => id === curId).length + 1
})

// Dynamic Step Label aware of looping and completed categories
const stepLabel = computed(() => {
  const stepNum = navigationHistory.value.length + 1
  if (currentIterationCount.value > 1) {
    return `Langkah ${stepNum} (Putaran Kategori Ke-${currentIterationCount.value})`
  }
  if (completedCategories.value.length > 0) {
    return `Langkah ${stepNum} (Kategori Ke-${completedCategories.value.length + 1})`
  }
  return `Langkah ${stepNum}`
})

// Category-aware progress percentage calculation
const progressPercentage = computed(() => {
  if (totalCategoryCount.value > 0) {
    const done = completedCategories.value.length
    const total = totalCategoryCount.value
    const pct = Math.round((done / total) * 100)
    return Math.min(Math.max(pct, 10), 100)
  }

  const totalSecs = sections.value.length || 1
  const currentStep = navigationHistory.value.length + 1
  return Math.min(Math.round((currentStep / totalSecs) * 100), 100)
})

function handleNext() {
  const success = goToNextSection()
  if (success && typeof window !== 'undefined') {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

function handlePrevious() {
  goToPreviousSection()
  if (typeof window !== 'undefined') {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

function handleSubmit() {
  submitSurvey(isPreview.value)
}

function reloadPage() {
  if (typeof window !== 'undefined') {
    window.location.reload()
  }
}

useSeoMeta({
  title: computed(() => survey.value ? `${survey.value.title} - Formly` : 'Pengisian Survei - Formly'),
  description: computed(() => survey.value?.description || 'Isi survei interaktif di Formly'),
})
</script>
