<template>
  <div class="space-y-2 p-4 sm:p-5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm transition-all">
    <!-- Question Header -->
    <div class="flex items-start justify-between">
      <h3 class="text-base sm:text-lg font-medium text-gray-900 dark:text-white leading-snug">
        {{ question.question_text || 'Pertanyaan Tanpa Judul' }}
        <span v-if="question.is_required" class="text-red-500 ml-0.5" title="Wajib diisi">*</span>
      </h3>
      <UBadge v-if="question.is_required" color="primary" variant="subtle" class="shrink-0 ml-2">
        Wajib
      </UBadge>
    </div>

    <!-- Question Input by Type -->
    <div class="pt-2">
      <!-- 1. Short Text -->
      <div v-if="question.type === 'short_text'">
        <UInput
          :model-value="modelValue"
          placeholder="Tuliskan jawaban Anda..."
          size="md"
          class="w-full"
          :color="errorMessage ? 'error' : 'neutral'"
          @update:model-value="onUpdateValue"
        />
      </div>

      <!-- 2. Long Text -->
      <div v-else-if="question.type === 'long_text'">
        <UTextarea
          :model-value="modelValue"
          placeholder="Tuliskan jawaban lengkap Anda..."
          :rows="4"
          size="md"
          class="w-full"
          :color="errorMessage ? 'error' : 'neutral'"
          @update:model-value="onUpdateValue"
        />
      </div>

      <!-- 3. Multiple Choice -->
      <div v-else-if="question.type === 'multiple_choice'" class="space-y-2">
        <div
          v-for="(option, idx) in availableOptions"
          :key="option.id || idx"
          class="flex items-center p-3 rounded-lg border cursor-pointer transition-all select-none"
          :class="[
            isOptionSelected(option)
              ? 'border-primary-500 bg-primary-50/50 dark:bg-primary-950/20 ring-1 ring-primary-500'
              : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 bg-white dark:bg-gray-900'
          ]"
          @click="selectOption(option)"
        >
          <input
            type="radio"
            :name="`q_${question.id}`"
            :checked="isOptionSelected(option)"
            class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 cursor-pointer pointer-events-none"
          />
          <span class="ml-3 text-sm font-medium text-gray-800 dark:text-gray-200">
            {{ option.text }}
          </span>
        </div>

        <p v-if="availableOptions.length === 0" class="text-xs text-gray-500 italic py-1">
          Seluruh pilihan opsi/kategori telah diselesaikan.
        </p>
      </div>

      <!-- 4. Rating (Google Reviews Style) -->
      <div v-else-if="question.type === 'rating'" class="space-y-2 pt-1">
        <div
          class="flex flex-wrap items-center gap-1 sm:gap-1.5 select-none"
          @mouseleave="hoverRating = null"
        >
          <button
            v-for="star in maxStars"
            :key="star"
            type="button"
            class="p-1 sm:p-1.5 focus:outline-none transition-transform duration-150 transform hover:scale-125 active:scale-95 cursor-pointer"
            @mouseenter="hoverRating = star"
            @click="onUpdateValue(star)"
          >
            <svg
              class="w-8 h-8 sm:w-9 sm:h-9 transition-colors duration-150 drop-shadow-xs"
              :class="[
                star <= (hoverRating ?? Number(modelValue) ?? 0)
                  ? 'text-amber-400 fill-amber-400'
                  : 'text-gray-300 dark:text-gray-700 fill-gray-200 dark:fill-gray-800'
              ]"
              viewBox="0 0 24 24"
            >
              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
            </svg>
          </button>

          <!-- Selected Rating Indicator / Score Badge -->
          <div class="ml-2 flex items-center space-x-1">
            <span v-if="modelValue" class="text-sm font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-2.5 py-1 rounded-full border border-amber-200 dark:border-amber-900/50">
              {{ modelValue }} / {{ maxStars }} Bintang
            </span>
            <span v-else class="text-xs text-gray-400 italic">
              Pilih 1 hingga {{ maxStars }} bintang
            </span>
          </div>
        </div>
      </div>

      <!-- 5. Default Fallback -->
      <div v-else>
        <UInput
          :model-value="modelValue"
          placeholder="Tuliskan jawaban Anda..."
          size="md"
          class="w-full"
          :color="errorMessage ? 'error' : 'neutral'"
          @update:model-value="onUpdateValue"
        />
      </div>
    </div>

    <!-- Error Validation Message -->
    <div v-if="errorMessage" class="flex items-center space-x-1 text-xs text-red-600 dark:text-red-400 pt-1 font-medium">
      <UIcon name="i-heroicons-exclamation-circle" class="w-4 h-4 shrink-0" />
      <span>{{ errorMessage }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Database } from '~/types/supabase'

type Question = Database['public']['Tables']['questions']['Row']

export interface ChoiceOption {
  id: string
  text: string
  isCompleted?: boolean
}

const props = defineProps<{
  question: Question
  modelValue: any
  errorMessage?: string | null
  completedCategories?: string[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: any): void
}>()

const hoverRating = ref<number | null>(null)

// Calculate max rating stars dynamically bounded between 1 and 10
const maxStars = computed<number>(() => {
  if (props.question.type !== 'rating') return 5
  const opts = props.question.options
  if (!opts || typeof opts !== 'object' || Array.isArray(opts)) return 5
  const num = Number((opts as any).max_rating || (opts as any).maxRating || 5)
  return Math.min(Math.max(isNaN(num) ? 5 : num, 1), 10)
})

// Process multiple choice options & hide completed categories in looped section
const availableOptions = computed<ChoiceOption[]>(() => {
  if (props.question.type !== 'multiple_choice') return []

  let rawOpts: any[] = []
  if (Array.isArray(props.question.options)) {
    rawOpts = props.question.options
  } else if (typeof props.question.options === 'string') {
    try {
      rawOpts = JSON.parse(props.question.options)
    } catch {
      rawOpts = []
    }
  }

  if (!Array.isArray(rawOpts)) {
    rawOpts = []
  }

  const completed = props.completedCategories || []

  const mapped = rawOpts.map((opt: any, idx: number) => {
    let id = `opt_${idx + 1}`
    let text = ''

    if (typeof opt === 'object' && opt !== null) {
      id = opt.id || opt.value || `opt_${idx + 1}`
      text = opt.text || opt.label || opt.title || String(opt.id || idx + 1)
    } else {
      id = String(opt)
      text = String(opt)
    }

    const uniqueKey = `${props.question.id}_${id}`
    const isGenericTrigger = ['ya', 'tidak', 'yes', 'no'].includes(text.trim().toLowerCase())

    // Option is completed ONLY if it's not a generic loop trigger (like Ya/Tidak) AND matches completedCategories
    const isCompleted = !isGenericTrigger && (
      completed.includes(uniqueKey) ||
      completed.includes(text)
    )

    return {
      id,
      text,
      isCompleted,
    }
  })

  // Hide completed category options unless currently selected for this question
  return mapped.filter((opt) => !opt.isCompleted || isOptionSelected(opt))
})

function isOptionSelected(option: ChoiceOption): boolean {
  if (props.modelValue === undefined || props.modelValue === null) return false
  if (typeof props.modelValue === 'object') {
    return props.modelValue.id === option.id || props.modelValue.text === option.text
  }
  return String(props.modelValue) === option.id || String(props.modelValue) === option.text
}

function selectOption(option: ChoiceOption) {
  emit('update:modelValue', { id: option.id, text: option.text })
}

function onUpdateValue(val: any) {
  emit('update:modelValue', val)
}
</script>
