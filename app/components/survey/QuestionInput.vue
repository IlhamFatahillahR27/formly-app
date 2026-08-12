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
              : option.isCompleted
                ? 'border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-800/50 opacity-60'
                : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 bg-white dark:bg-gray-900'
          ]"
          @click="selectOption(option)"
        >
          <input
            type="radio"
            :name="`q_${question.id}`"
            :checked="isOptionSelected(option)"
            :disabled="option.isCompleted && !isOptionSelected(option)"
            class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 cursor-pointer pointer-events-none"
          />
          <span class="ml-3 text-sm font-medium text-gray-800 dark:text-gray-200">
            {{ option.text }}
          </span>
          <UBadge
            v-if="option.isCompleted && !isOptionSelected(option)"
            color="neutral"
            variant="soft"
            size="xs"
            class="ml-auto"
          >
            Selesai
          </UBadge>
        </div>

        <p v-if="availableOptions.length === 0" class="text-xs text-gray-500 italic py-1">
          Tidak ada opsi jawaban tersedia.
        </p>
      </div>

      <!-- 4. Rating -->
      <div v-else-if="question.type === 'rating'" class="flex flex-wrap items-center gap-2 pt-1">
        <button
          v-for="star in 5"
          :key="star"
          type="button"
          class="flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-lg border font-semibold text-sm transition-all focus:outline-none"
          :class="[
            Number(modelValue) === star
              ? 'bg-amber-500 text-white border-amber-500 shadow-sm scale-105'
              : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:border-amber-400 hover:text-amber-500'
          ]"
          @click="onUpdateValue(star)"
        >
          <span class="flex items-center space-x-1">
            <span>{{ star }}</span>
            <UIcon
              name="i-heroicons-star-solid"
              class="w-3.5 h-3.5"
              :class="Number(modelValue) === star ? 'text-white' : 'text-amber-400'"
            />
          </span>
        </button>
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

// Robustly process multiple choice options & state elimination
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

  return rawOpts.map((opt: any, idx: number) => {
    let id = `opt_${idx + 1}`
    let text = ''

    if (typeof opt === 'object' && opt !== null) {
      id = opt.id || opt.value || `opt_${idx + 1}`
      text = opt.text || opt.label || opt.title || String(opt.id || idx + 1)
    } else {
      id = String(opt)
      text = String(opt)
    }

    const isCompleted = completed.includes(id) || completed.includes(text)

    return {
      id,
      text,
      isCompleted,
    }
  })
})

function isOptionSelected(option: ChoiceOption): boolean {
  if (props.modelValue === undefined || props.modelValue === null) return false
  if (typeof props.modelValue === 'object') {
    return props.modelValue.id === option.id || props.modelValue.text === option.text
  }
  return String(props.modelValue) === option.id || String(props.modelValue) === option.text
}

function selectOption(option: ChoiceOption) {
  if (option.isCompleted && !isOptionSelected(option)) return
  emit('update:modelValue', { id: option.id, text: option.text })
}

function onUpdateValue(val: any) {
  emit('update:modelValue', val)
}
</script>
