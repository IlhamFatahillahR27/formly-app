<template>
  <UCard class="border border-gray-200 dark:border-gray-800 shadow-sm transition-all hover:shadow-md">
    <template #header>
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-2 truncate">
          <UButton
            size="xs"
            color="secondary"
            variant="ghost"
            :icon="isCollapsed ? 'i-heroicons-chevron-right' : 'i-heroicons-chevron-down'"
            @click="isCollapsed = !isCollapsed"
          />
          <UBadge color="primary" variant="soft" size="sm">
            Pertanyaan #{{ index + 1 }}
          </UBadge>
          <span class="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate max-w-xs">
            {{ questionText || 'Pertanyaan Tanpa Judul' }}
          </span>
        </div>

        <div class="flex items-center space-x-2 shrink-0">
          <!-- Question Reorder Controls -->
          <div class="flex items-center space-x-0.5 bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded-lg border border-gray-200 dark:border-gray-700">
            <UButton
              size="xs"
              color="neutral"
              variant="ghost"
              icon="i-heroicons-arrow-up"
              :disabled="isFirstQuestion"
              title="Pindahkan Pertanyaan ke Atas"
              @click="onMoveQuestionUp"
            />
            <UButton
              size="xs"
              color="neutral"
              variant="ghost"
              icon="i-heroicons-arrow-down"
              :disabled="isLastQuestion"
              title="Pindahkan Pertanyaan ke Bawah"
              @click="onMoveQuestionDown"
            />
          </div>

          <!-- Required / Optional Switch Toggle -->
          <div class="flex items-center space-x-1.5 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-lg border border-gray-200 dark:border-gray-700">
            <USwitch
              :model-value="isRequired"
              size="xs"
              color="primary"
              @update:model-value="onUpdateRequired"
            />
            <button
              type="button"
              class="text-xs font-medium cursor-pointer transition-colors"
              :class="isRequired ? 'text-primary-600 dark:text-primary-400 font-bold' : 'text-gray-500 dark:text-gray-400'"
              @click="onUpdateRequired(!isRequired)"
            >
              {{ isRequired ? 'Wajib Diisi' : 'Opsional' }}
            </button>
          </div>

          <UButton
            color="error"
            variant="ghost"
            icon="i-heroicons-trash"
            size="xs"
            title="Hapus Pertanyaan"
            @click="onDelete"
          />
        </div>
      </div>
    </template>

    <div v-if="!isCollapsed" class="space-y-4">
      <!-- Question Text & Type Row -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div class="md:col-span-2">
          <label class="block text-2xs font-semibold text-gray-600 dark:text-gray-400 mb-1 flex justify-between">
            <span>Teks Pertanyaan</span>
            <button
              v-if="questionText"
              type="button"
              class="text-gray-400 hover:text-red-500 transition-colors font-normal cursor-pointer"
              @click="clearQuestionText"
            >
              Kosongkan Teks
            </button>
          </label>
          <UInput
            v-model="questionText"
            placeholder="Masukkan pertanyaan..."
            size="sm"
            class="w-full"
            @blur="onSaveQuestionText"
          />
        </div>

        <div>
          <label class="block text-2xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
            Tipe Pertanyaan
          </label>
          <select
            :value="selectedType"
            class="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-2.5 py-1.5 text-xs text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none transition-colors cursor-pointer"
            @change="(e: Event) => onTypeChange((e.target as HTMLSelectElement).value as QuestionType)"
          >
            <option
              v-for="opt in questionTypeOptions"
              :key="opt.value"
              :value="opt.value"
            >
              {{ opt.label }}
            </option>
          </select>
        </div>
      </div>

      <!-- Multiple Choice Options Manager -->
      <div v-if="question.type === 'multiple_choice'" class="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg space-y-2">
        <div class="flex items-center justify-between">
          <span class="text-xs font-medium text-gray-700 dark:text-gray-300">
            Daftar Opsi Jawaban
          </span>
          <div class="flex items-center space-x-2">
            <UButton
              v-if="optionsList.length > 0"
              size="xs"
              color="neutral"
              variant="ghost"
              icon="i-heroicons-trash"
              @click="clearAllOptions"
            >
              Kosongkan Opsi
            </UButton>
            <UButton
              size="xs"
              color="primary"
              variant="soft"
              icon="i-heroicons-plus"
              @click="addOption"
            >
              Tambah Opsi
            </UButton>
          </div>
        </div>

        <div v-if="optionsList.length === 0" class="text-2xs text-gray-400 py-1">
          Belum ada opsi. Klik 'Tambah Opsi'.
        </div>

        <div
          v-for="(opt, oIdx) in optionsList"
          :key="opt.id"
          class="flex items-center space-x-2"
        >
          <span class="text-2xs text-gray-400 font-mono w-6">{{ oIdx + 1 }}.</span>
          <UInput
            v-model="opt.text"
            placeholder="Nama opsi..."
            size="xs"
            class="flex-1"
            @blur="saveOptions"
          />
          <div class="flex items-center space-x-0.5">
            <UButton
              size="xs"
              color="neutral"
              variant="ghost"
              icon="i-heroicons-arrow-up"
              :disabled="oIdx === 0"
              title="Pindahkan Opsi ke Atas"
              @click="moveOptionUp(oIdx)"
            />
            <UButton
              size="xs"
              color="neutral"
              variant="ghost"
              icon="i-heroicons-arrow-down"
              :disabled="oIdx === optionsList.length - 1"
              title="Pindahkan Opsi ke Bawah"
              @click="moveOptionDown(oIdx)"
            />
          </div>
          <UButton
            size="xs"
            color="error"
            variant="ghost"
            icon="i-heroicons-x-mark"
            @click="removeOption(opt.id)"
          />
        </div>
      </div>

      <!-- Rating Configuration & Live Star Preview -->
      <div v-if="question.type === 'rating'" class="p-3 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 rounded-lg space-y-3">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold text-gray-800 dark:text-gray-200 flex items-center">
            <UIcon name="i-heroicons-star-solid" class="w-4 h-4 mr-1.5 text-amber-500" />
            Pengaturan Skala Rating
          </span>
          <div class="flex items-center space-x-2">
            <label class="text-2xs text-gray-600 dark:text-gray-400 font-medium">Batas Maksimal Bintang (1-10):</label>
            <select
              :value="maxRating"
              class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded px-2 py-1 text-xs font-bold text-amber-600 dark:text-amber-400 focus:outline-none cursor-pointer"
              @change="onMaxRatingChange"
            >
              <option v-for="n in 10" :key="n" :value="n">{{ n }} Bintang</option>
            </select>
          </div>
        </div>

        <!-- Live Rating Stars Preview -->
        <div class="pt-1">
          <span class="text-2xs font-medium text-gray-500 block mb-1">Pratinjau Rating:</span>
          <div class="flex flex-wrap items-center gap-1.5">
            <button
              v-for="star in maxRating"
              :key="star"
              type="button"
              class="p-1 text-amber-400 hover:scale-110 transition-transform"
              title="Pratinjau Bintang"
            >
              <svg class="w-6 h-6 fill-current text-amber-400 drop-shadow-sm" viewBox="0 0 24 24">
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
              </svg>
            </button>
            <span class="text-2xs font-semibold text-gray-500 dark:text-gray-400 ml-2">
              (Skala 1 - {{ maxRating }})
            </span>
          </div>
        </div>
      </div>

      <!-- Logic Branching Rule List & Creator -->
      <div class="border-t border-gray-100 dark:border-gray-800 pt-3">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center">
            <UIcon name="i-heroicons-variable" class="w-3.5 h-3.5 mr-1 text-emerald-500" />
            Aturan Logic Branching ({{ existingRules.length }})
          </span>
          <UButton
            v-if="!isAddingRule"
            size="xs"
            color="info"
            variant="soft"
            icon="i-heroicons-plus"
            @click="isAddingRule = true"
          >
            Tambah Rule
          </UButton>
        </div>

        <!-- Existing Rules Table/List -->
        <div v-if="existingRules.length > 0" class="space-y-1.5 mb-2">
          <div
            v-for="rule in existingRules"
            :key="rule.id"
            class="flex items-center justify-between p-2 rounded bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-800/40 text-2xs"
          >
            <div class="flex items-center space-x-1 text-gray-700 dark:text-gray-300">
              <span class="font-medium">JIKA</span>
              <UBadge size="sm" color="info" variant="outline">{{ rule.operator }}</UBadge>
              <span v-if="rule.condition_value" class="font-bold text-emerald-600 dark:text-emerald-400">
                "{{ rule.condition_value }}"
              </span>
              <span>LANJUT KE &rarr;</span>
              <span class="font-bold underline">{{ getSectionTitle(rule.target_section_id) }}</span>
            </div>

            <UButton
              size="xs"
              color="error"
              variant="ghost"
              icon="i-heroicons-trash"
              @click="deleteRule(rule.id)"
            />
          </div>
        </div>

        <!-- Add Rule Form -->
        <div v-if="isAddingRule" class="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 space-y-2 text-2xs">
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div>
              <label class="block text-2xs text-gray-500 mb-1">Operator</label>
              <select
                v-model="newRuleOperator"
                class="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded px-2 py-1 text-2xs text-gray-900 dark:text-white focus:outline-none cursor-pointer"
              >
                <option
                  v-for="opt in operatorOptions"
                  :key="opt.value"
                  :value="opt.value"
                >
                  {{ opt.label }}
                </option>
              </select>
            </div>

            <div v-if="question.type === 'multiple_choice'">
              <label class="block text-2xs text-gray-500 mb-1">Pilih Opsi</label>
              <select
                v-model="newRuleConditionValue"
                class="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded px-2 py-1 text-2xs text-gray-900 dark:text-white focus:outline-none cursor-pointer"
              >
                <option
                  v-for="opt in optionSelectOptions"
                  :key="opt.value"
                  :value="opt.value"
                >
                  {{ opt.label }}
                </option>
              </select>
            </div>
            <div v-else-if="newRuleOperator !== 'filled'">
              <label class="block text-2xs text-gray-500 mb-1">Nilai Kondisi</label>
              <UInput
                v-model="newRuleConditionValue"
                placeholder="Nilai..."
                size="xs"
                class="w-full"
              />
            </div>

            <div>
              <label class="block text-2xs text-gray-500 mb-1">Target Section</label>
              <select
                v-model="newRuleTargetSectionId"
                class="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded px-2 py-1 text-2xs text-gray-900 dark:text-white focus:outline-none cursor-pointer"
              >
                <option
                  v-for="opt in targetSectionSelectOptions"
                  :key="opt.value"
                  :value="opt.value"
                >
                  {{ opt.label }}
                </option>
              </select>
            </div>
          </div>

          <div class="flex justify-end space-x-2 pt-1">
            <UButton size="xs" color="secondary" variant="ghost" @click="isAddingRule = false">
              Batal
            </UButton>
            <UButton size="xs" color="info" @click="saveNewRule">
              Simpan Rule
            </UButton>
          </div>
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import {
  useSurveyBuilder,
  type QuestionRow,
  type SectionRow,
  type SectionLogicRow,
  type QuestionOption,
  type QuestionType,
  type LogicOperator,
} from '~/composables/useSurveyBuilder'

const props = defineProps<{
  question: QuestionRow
  index: number
  sections: SectionRow[]
  logicRules: SectionLogicRow[]
  isFirstQuestion?: boolean
  isLastQuestion?: boolean
}>()

const { updateQuestion, deleteQuestion, moveQuestion, createLogicRule, deleteLogicRule } = useSurveyBuilder()

const isCollapsed = ref(false)

const questionText = ref(props.question.question_text)
const selectedType = ref<QuestionType>(props.question.type)
const isRequired = ref(props.question.is_required)

const optionsList = ref<QuestionOption[]>([])

// Populate optionsList
watch(
  () => props.question.options,
  (val) => {
    if (Array.isArray(val)) {
      optionsList.value = JSON.parse(JSON.stringify(val))
    } else {
      optionsList.value = []
    }
  },
  { immediate: true }
)

const maxRating = computed<number>(() => {
  if (!props.question.options || typeof props.question.options !== 'object' || Array.isArray(props.question.options)) {
    return 5
  }
  const opts = props.question.options as Record<string, unknown>
  const val = Number(opts.max_rating || opts.maxRating || 5)
  return Math.min(Math.max(isNaN(val) ? 5 : val, 1), 10)
})

async function onMaxRatingChange(e: Event) {
  const target = e.target as HTMLSelectElement | null
  const newMax = Math.min(Math.max(Number(target?.value) || 5, 1), 10)
  
  let currentOpts: Record<string, unknown> = {}
  if (props.question.options && typeof props.question.options === 'object' && !Array.isArray(props.question.options)) {
    currentOpts = { ...(props.question.options as Record<string, unknown>) }
  }
  currentOpts.max_rating = newMax

  await updateQuestion(props.question.id, {
    options: currentOpts as unknown as typeof props.question.options,
  })
}

const questionTypeOptions = [
  { value: 'short_text', label: 'Isian Singkat (Short Text)' },
  { value: 'long_text', label: 'Isian Panjang (Long Text)' },
  { value: 'multiple_choice', label: 'Pilihan Ganda (Multiple Choice)' },
  { value: 'rating', label: 'Skala Rating' },
]

const operatorOptions = computed(() => {
  if (props.question.type === 'multiple_choice') {
    return [
      { value: 'selected', label: 'Opsi Dipilih (selected)' },
      { value: 'not_equals', label: 'Tidak Sama Dengan (not_equals)' },
    ]
  }
  return [
    { value: 'filled', label: 'Terisi / Tidak Kosong (filled)' },
    { value: 'equals', label: 'Sama Dengan (equals)' },
    { value: 'not_equals', label: 'Tidak Sama Dengan (not_equals)' },
    { value: 'greater_than', label: 'Lebih Besar Dari (greater_than)' },
    { value: 'less_than', label: 'Lebih Kecil Dari (less_than)' },
  ]
})

const optionSelectOptions = computed(() => {
  return optionsList.value.map((opt) => ({
    value: opt.id,
    label: opt.text || opt.id,
  }))
})

const targetSectionSelectOptions = computed(() => {
  return props.sections.map((sec) => ({
    value: sec.id,
    label: sec.title,
  }))
})

const existingRules = computed(() => {
  return props.logicRules.filter((l) => l.question_id === props.question.id)
})

// Rule addition state
const isAddingRule = ref(false)
const newRuleOperator = ref<LogicOperator>('selected')
const newRuleConditionValue = ref('')
const newRuleTargetSectionId = ref('')

watch(
  () => props.question.type,
  (newType) => {
    if (newType === 'multiple_choice') {
      newRuleOperator.value = 'selected'
      if (optionsList.value.length > 0) {
        newRuleConditionValue.value = optionsList.value[0]?.id || ''
      }
    } else {
      newRuleOperator.value = 'filled'
      newRuleConditionValue.value = ''
    }
  },
  { immediate: true }
)

function getSectionTitle(sectionId: string): string {
  const sec = props.sections.find((s) => s.id === sectionId)
  return sec ? sec.title : sectionId.slice(0, 8)
}

async function clearQuestionText() {
  questionText.value = ''
  await updateQuestion(props.question.id, { question_text: '' })
}

async function onSaveQuestionText() {
  if (questionText.value !== props.question.question_text) {
    await updateQuestion(props.question.id, { question_text: questionText.value })
  }
}

async function onUpdateRequired(val: boolean) {
  isRequired.value = val
  await updateQuestion(props.question.id, { is_required: val })
}

async function onTypeChange(type: QuestionType) {
  selectedType.value = type
  let opts = props.question.options
  if (type === 'multiple_choice' && optionsList.value.length === 0) {
    optionsList.value = [
      { id: 'opt_1', text: 'Opsi 1' },
      { id: 'opt_2', text: 'Opsi 2' },
    ]
    opts = optionsList.value as unknown as typeof opts
  }
  await updateQuestion(props.question.id, { type, options: opts })
}

function addOption() {
  const nextId = `opt_${optionsList.value.length + 1}`
  optionsList.value.push({ id: nextId, text: `Opsi ${optionsList.value.length + 1}` })
  saveOptions()
}

function removeOption(optId: string) {
  optionsList.value = optionsList.value.filter((o) => o.id !== optId)
  saveOptions()
}

function moveOptionUp(oIdx: number) {
  if (oIdx <= 0) return
  const item = optionsList.value.splice(oIdx, 1)[0]
  if (item) {
    optionsList.value.splice(oIdx - 1, 0, item)
    saveOptions()
  }
}

function moveOptionDown(oIdx: number) {
  if (oIdx < 0 || oIdx >= optionsList.value.length - 1) return
  const item = optionsList.value.splice(oIdx, 1)[0]
  if (item) {
    optionsList.value.splice(oIdx + 1, 0, item)
    saveOptions()
  }
}

async function saveOptions() {
  await updateQuestion(props.question.id, {
    options: optionsList.value as unknown as typeof props.question.options,
  })
}

async function onMoveQuestionUp() {
  await moveQuestion(props.question.id, 'up')
}

async function onMoveQuestionDown() {
  await moveQuestion(props.question.id, 'down')
}

async function onDelete() {
  await deleteQuestion(props.question.id)
}

async function deleteRule(ruleId: string) {
  await deleteLogicRule(ruleId)
}

async function saveNewRule() {
  if (!newRuleTargetSectionId.value) {
    if (props.sections && props.sections.length > 0) {
      newRuleTargetSectionId.value = props.sections[0]?.id || ''
    } else {
      return
    }
  }

  await createLogicRule({
    source_section_id: props.question.section_id,
    question_id: props.question.id,
    operator: newRuleOperator.value,
    condition_value: newRuleConditionValue.value || null,
    target_section_id: newRuleTargetSectionId.value,
  })

  isAddingRule.value = false
}
</script>
