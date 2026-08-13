<template>
  <div
    class="w-72 bg-white dark:bg-gray-900 border-2 rounded-xl shadow-lg transition-all duration-200"
    :class="[
      selected ? 'border-primary-500 ring-2 ring-primary-500/20' : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700',
      data.isStart ? 'ring-2 ring-emerald-500/30 border-emerald-500' : '',
      data.section.is_end_section ? 'ring-2 ring-amber-500/30 border-amber-500' : ''
    ]"
  >
    <!-- Target Handle (Incoming Connections to this section) -->
    <Handle
      type="target"
      :position="Position.Top"
      :id="`sec-target__${data.section.id}`"
      class="!bg-primary-500 !w-3.5 !h-3.5 !-top-2 !z-30 hover:scale-125 transition-transform cursor-pointer"
    />

    <!-- Header -->
    <div class="p-3 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/50 rounded-t-xl">
      <div class="flex items-center space-x-2 truncate">
        <UIcon name="i-heroicons-squares-2x2" class="w-4 h-4 text-gray-400 shrink-0" />
        <span class="font-bold text-sm text-gray-900 dark:text-white truncate">
          {{ data.section.title }}
        </span>
      </div>

      <div class="flex items-center space-x-1 shrink-0">
        <UBadge v-if="data.isStart" size="sm" color="success" variant="soft">
          Start
        </UBadge>
        <UBadge v-if="data.section.is_end_section" size="sm" color="warning" variant="soft">
          End
        </UBadge>

        <UButton
          size="sm"
          color="neutral"
          variant="ghost"
          :icon="isCollapsed ? 'i-heroicons-chevron-down' : 'i-heroicons-chevron-up'"
          @click.stop="toggleCollapse"
        />
      </div>
    </div>

    <!-- Description if present -->
    <div v-if="data.section.description" class="px-3 py-1.5 text-xs text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800">
      {{ data.section.description }}
    </div>

    <!-- Collapsible Questions List -->
    <div v-if="!isCollapsed" class="p-3 space-y-3 max-h-96 overflow-y-auto">
      <div v-if="data.questions.length === 0" class="text-center py-3 text-xs text-gray-400 border border-dashed border-gray-200 dark:border-gray-800 rounded-lg">
        Belum ada pertanyaan
      </div>

      <div
        v-for="(q, idx) in data.questions"
        :key="q.id"
        class="relative bg-gray-50 dark:bg-gray-800/60 p-2.5 rounded-lg border border-gray-200/80 dark:border-gray-700/60 text-xs"
      >
        <div class="flex items-start justify-between font-medium text-gray-800 dark:text-gray-200 mb-1 pr-3">
          <span>{{ idx + 1 }}. {{ q.question_text }}</span>
          <UBadge size="sm" variant="outline" color="neutral" class="shrink-0 ml-1">
            {{ getQuestionTypeLabel(q.type) }}
          </UBadge>
        </div>

        <!-- Question handle -->
        <Handle
          type="source"
          :position="Position.Right"
          :id="`q-source__${q.id}`"
          class="!bg-blue-500 !w-3 !h-3 !-right-1.5 !z-30 hover:scale-125 transition-transform cursor-pointer"
        />

        <!-- Multiple Choice Options -->
        <div v-if="q.type === 'multiple_choice' && getQuestionOptions(q).length > 0" class="mt-2 space-y-1 pl-2 border-l-2 border-gray-200 dark:border-gray-700">
          <div
            v-for="opt in getQuestionOptions(q)"
            :key="opt.id"
            class="relative flex items-center justify-between py-1 px-1.5 rounded bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-2xs text-gray-600 dark:text-gray-300"
          >
            <span class="truncate max-w-[170px]">🔘 {{ opt.text }}</span>
            <!-- Source handle for choice option branching -->
            <Handle
              type="source"
              :position="Position.Right"
              :id="`opt-source__${q.id}__${opt.id}`"
              class="!bg-emerald-500 !w-3 !h-3 !-right-1.5 !z-30 hover:scale-125 transition-transform cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Footer Fallback Next Section Connection handle -->
    <div class="relative px-3 py-2 bg-gray-50/80 dark:bg-gray-800/80 border-t border-gray-100 dark:border-gray-800 rounded-b-xl flex items-center justify-between text-2xs text-gray-500 dark:text-gray-400">
      <span>What Next (Fallback)</span>
      <UIcon name="i-heroicons-arrow-small-right" class="w-3.5 h-3.5 text-primary-500" />
      <Handle
        type="source"
        :position="Position.Right"
        :id="`sec-fallback__${data.section.id}`"
        class="!bg-purple-500 !w-3.5 !h-3.5 !-right-1.5 !z-30 hover:scale-125 transition-transform cursor-pointer"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'
import type { SectionRow, QuestionRow, QuestionOption } from '~/composables/useSurveyBuilder'

export interface SectionNodeData {
  section: SectionRow
  questions: QuestionRow[]
  isStart?: boolean
  collapsed?: boolean
}

const props = defineProps<{
  id: string
  selected?: boolean
  data: SectionNodeData
}>()

const emit = defineEmits<{
  (e: 'toggle-collapse', sectionId: string): void
}>()

const isCollapsed = ref(props.data?.collapsed ?? false)

watch(
  () => props.data?.collapsed,
  (val) => {
    if (val !== undefined) {
      isCollapsed.value = val
    }
  }
)

function toggleCollapse() {
  isCollapsed.value = !isCollapsed.value
  emit('toggle-collapse', props.data.section.id)
}

function getQuestionTypeLabel(type: string): string {
  switch (type) {
    case 'short_text': return 'Isian Singkat'
    case 'long_text': return 'Isian Panjang'
    case 'multiple_choice': return 'Pilihan Ganda'
    case 'rating': return 'Skala Rating'
    default: return type
  }
}

function getQuestionOptions(q: QuestionRow): QuestionOption[] {
  if (!q.options) return []
  if (Array.isArray(q.options)) {
    return q.options as unknown as QuestionOption[]
  }
  return []
}
</script>
