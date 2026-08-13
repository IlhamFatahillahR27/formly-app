<template>
  <div class="w-full h-[650px] relative rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-900 overflow-hidden">
    <VueFlow
      :nodes="nodes"
      :edges="edges"
      :default-viewport="{ zoom: 0.9, x: 50, y: 50 }"
      :min-zoom="0.2"
      :max-zoom="2"
      :connectable="true"
      fit-view-on-init
      class="w-full h-full"
      @node-drag-stop="handleNodeDragStop"
      @connect="handleConnect"
      @edges-change="handleEdgesChange"
      @edge-click="handleEdgeClick"
    >
      <!-- Registered Custom Section Node -->
      <template #node-section="nodeProps">
        <SectionNode
          :id="nodeProps.id"
          :selected="nodeProps.selected"
          :data="nodeProps.data"
          @toggle-collapse="handleToggleCollapse"
        />
      </template>

      <!-- Vue Flow Controls, Background & MiniMap -->
      <Background pattern-color="#374151" :gap="16" />
      <Controls :position="PanelPosition.TopLeft" class="!bg-white dark:!bg-gray-800 !border-gray-200 dark:!border-gray-700 !rounded-lg" />
      <MiniMap :position="PanelPosition.BottomRight" class="!bg-gray-900 !border-gray-700 !rounded-lg" />
    </VueFlow>

    <!-- Canvas Helper Banner -->
    <div class="absolute bottom-4 left-4 z-10 bg-gray-900/90 backdrop-blur border border-gray-800 rounded-lg px-3 py-2 text-2xs text-gray-300 flex items-center space-x-3 shadow-lg">
      <div class="flex items-center space-x-1">
        <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
        <span>Opsi Pilihan (Hijau)</span>
      </div>
      <div class="flex items-center space-x-1">
        <span class="w-2 h-2 rounded-full bg-blue-500"></span>
        <span>Pertanyaan (Biru)</span>
      </div>
      <div class="flex items-center space-x-1">
        <span class="w-2 h-2 rounded-full bg-purple-500"></span>
        <span>Default Next (Ungu)</span>
      </div>
      <div class="text-gray-500">| Klik garis untuk edit rules / hapus koneksi</div>
    </div>

    <!-- Edge Rule / Connection Configurator Modal -->
    <UModal v-model:open="isModalOpen" title="Pengaturan Alur Logika / Koneksi">
      <template #content>
        <div class="p-6 space-y-4">
          <div v-if="selectedEdgeType === 'logic' && activeLogicRule" class="space-y-4 text-sm">
            <!-- Question Info -->
            <div class="p-3 bg-gray-50 dark:bg-gray-800/80 rounded-lg border border-gray-200 dark:border-gray-700 space-y-1">
              <div class="text-2xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Pertanyaan Sumber</div>
              <div class="font-semibold text-gray-900 dark:text-white">
                {{ activeQuestion?.question_text || 'Pertanyaan' }}
              </div>
              <div class="text-xs text-gray-500 dark:text-gray-400">
                Section Asal: <span class="font-medium text-gray-700 dark:text-gray-300">{{ getSectionTitle(activeLogicRule.source_section_id) }}</span>
              </div>
            </div>

            <!-- Operator Selection -->
            <div>
              <label class="block font-medium text-xs text-gray-700 dark:text-gray-300 mb-1">Operator Logika</label>
              <select
                v-model="editOperator"
                class="w-full text-xs rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white p-2.5 focus:ring-2 focus:ring-primary-500 cursor-pointer"
              >
                <option v-for="opt in availableOperators" :key="opt.value" :value="opt.value">
                  {{ opt.label }}
                </option>
              </select>
            </div>

            <!-- Condition Value -->
            <div v-if="editOperator !== 'filled'">
              <label class="block font-medium text-xs text-gray-700 dark:text-gray-300 mb-1">Nilai / Syarat Kondisi</label>
              <select
                v-if="activeQuestion?.type === 'multiple_choice' && questionOptions.length > 0"
                v-model="editConditionValue"
                class="w-full text-xs rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white p-2.5 focus:ring-2 focus:ring-primary-500 cursor-pointer"
              >
                <option v-for="opt in questionOptions" :key="opt.id" :value="opt.id">
                  {{ opt.text }}
                </option>
              </select>
              <input
                v-else
                v-model="editConditionValue"
                type="text"
                placeholder="Masukkan nilai kondisi..."
                class="w-full text-xs rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white p-2.5 focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <!-- Target Section Selection -->
            <div>
              <label class="block font-medium text-xs text-gray-700 dark:text-gray-300 mb-1">Target Section Tujuan</label>
              <select
                v-model="editTargetSectionId"
                class="w-full text-xs rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white p-2.5 focus:ring-2 focus:ring-primary-500 cursor-pointer"
              >
                <option v-for="sec in sections" :key="sec.id" :value="sec.id">
                  {{ sec.title }}
                </option>
              </select>
            </div>

            <!-- Modal Actions -->
            <div class="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-800">
              <UButton color="danger" variant="ghost" icon="i-heroicons-trash" @click="handleDeleteSelectedEdge">
                Hapus Garis
              </UButton>
              <div class="flex items-center space-x-2">
                <UButton color="neutral" variant="ghost" @click="isModalOpen = false">
                  Batal
                </UButton>
                <UButton color="primary" @click="handleSaveLogicRule">
                  Simpan Perubahan
                </UButton>
              </div>
            </div>
          </div>

          <div v-else-if="selectedEdgeType === 'fallback' && activeFallbackSection" class="space-y-4 text-sm">
            <div class="p-3 bg-purple-50 dark:bg-purple-950/40 rounded-lg border border-purple-200 dark:border-purple-800 space-y-1">
              <div class="text-2xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider">Koneksi Default Next Section</div>
              <div class="font-medium text-gray-900 dark:text-white">
                From: {{ activeFallbackSection.title }}
              </div>
            </div>

            <div>
              <label class="block font-medium text-xs text-gray-700 dark:text-gray-300 mb-1">Target Section Tujuan (Default Next)</label>
              <select
                v-model="editTargetSectionId"
                class="w-full text-xs rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white p-2.5 focus:ring-2 focus:ring-primary-500 cursor-pointer"
              >
                <option v-for="sec in availableFallbackTargets" :key="sec.id" :value="sec.id">
                  {{ sec.title }}
                </option>
              </select>
            </div>

            <div class="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-800">
              <UButton color="danger" variant="ghost" icon="i-heroicons-trash" @click="handleDeleteSelectedEdge">
                Hapus Garis
              </UButton>
              <div class="flex items-center space-x-2">
                <UButton color="neutral" variant="ghost" @click="isModalOpen = false">
                  Batal
                </UButton>
                <UButton color="primary" @click="handleSaveFallbackSection">
                  Simpan Perubahan
                </UButton>
              </div>
            </div>
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { VueFlow, useVueFlow, type Node, type Edge, type Connection, type NodeDragEvent } from '@vue-flow/core'
import { Background, Controls, MiniMap, PanelPosition } from '@vue-flow/additional-components'

import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'

import SectionNode from '~/components/builder/nodes/SectionNode.vue'
import { useSurveyBuilder, type QuestionRow, type LogicOperator, type SectionLogicRow, type SectionRow } from '~/composables/useSurveyBuilder'

const {
  survey,
  sections,
  questions,
  logicRules,
  updateNodePosition,
  updateSection,
  createLogicRule,
  updateLogicRule,
  deleteLogicRule,
} = useSurveyBuilder()

const { onEdgeClick } = useVueFlow()

const collapsedSections = ref<Record<string, boolean>>({})

function handleToggleCollapse(sectionId: string) {
  collapsedSections.value[sectionId] = !collapsedSections.value[sectionId]
}

// Modal & Edge Edit state
const isModalOpen = ref(false)
const selectedEdgeType = ref<'logic' | 'fallback' | null>(null)
const activeLogicRule = ref<SectionLogicRow | null>(null)
const activeFallbackSection = ref<SectionRow | null>(null)
const activeQuestion = ref<QuestionRow | null>(null)

const editOperator = ref<LogicOperator>('selected')
const editConditionValue = ref<string>('')
const editTargetSectionId = ref<string>('')

const availableOperators = computed(() => {
  if (activeQuestion.value?.type === 'multiple_choice') {
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

const questionOptions = computed(() => {
  if (!activeQuestion.value?.options) return []
  if (Array.isArray(activeQuestion.value.options)) {
    return activeQuestion.value.options as unknown as { id: string; text: string }[]
  }
  return []
})

const availableFallbackTargets = computed(() => {
  return (sections.value || []).filter((s) => s.id !== activeFallbackSection.value?.id)
})

function getSectionTitle(secId: string): string {
  const sec = sections.value.find((s) => s.id === secId)
  return sec?.title || secId
}

function getEdgeLabel(rule: SectionLogicRow): string {
  const q = questions.value.find((q) => q.id === rule.question_id)
  if (q?.type === 'multiple_choice' && rule.condition_value) {
    const opts = (Array.isArray(q.options) ? q.options : []) as unknown as { id: string; text: string }[]
    const opt = opts.find((o) => o.id === String(rule.condition_value))
    return `JIKA: "${opt?.text || rule.condition_value}"`
  }
  if (rule.operator === 'filled') return 'JIKA: Terisi'
  if (rule.operator === 'equals') return `JIKA = "${rule.condition_value || ''}"`
  if (rule.operator === 'not_equals') return `JIKA ≠ "${rule.condition_value || ''}"`
  if (rule.operator === 'greater_than') return `JIKA > "${rule.condition_value || ''}"`
  if (rule.operator === 'less_than') return `JIKA < "${rule.condition_value || ''}"`
  return `${rule.operator} ${rule.condition_value || ''}`
}

// Compute Vue Flow Nodes from `sections`
const nodes = computed<Node[]>(() => {
  return (sections.value || []).map((sec) => {
    const secQuestions = (questions.value || []).filter((q) => q.section_id === sec.id)

    return {
      id: sec.id,
      type: 'section',
      position: { x: sec.position_x, y: sec.position_y },
      data: {
        section: sec,
        questions: secQuestions,
        isStart: survey.value?.start_section_id === sec.id,
        collapsed: !!collapsedSections.value[sec.id],
      },
    }
  })
})

// Compute Vue Flow Edges from `logicRules` and `default_next_section_id`
const edges = computed<Edge[]>(() => {
  const edgeList: Edge[] = []

  // 1. Logic Rule Edges
  for (const rule of logicRules.value || []) {
    const q = questions.value.find((q) => q.id === rule.question_id)
    let sourceHandle = `q-source__${rule.question_id}`

    if (q?.type === 'multiple_choice' && rule.condition_value) {
      const condVal = typeof rule.condition_value === 'string' ? rule.condition_value : String(rule.condition_value)
      sourceHandle = `opt-source__${rule.question_id}__${condVal}`
    }

    edgeList.push({
      id: `logic-${rule.id}`,
      source: rule.source_section_id,
      sourceHandle,
      target: rule.target_section_id,
      targetHandle: `sec-target__${rule.target_section_id}`,
      label: getEdgeLabel(rule),
      animated: true,
      style: { stroke: '#10b981', strokeWidth: 2 },
    })
  }

  // 2. Default Next Section Fallback Edges
  for (const sec of sections.value || []) {
    if (sec.default_next_section_id) {
      edgeList.push({
        id: `fallback-${sec.id}`,
        source: sec.id,
        sourceHandle: `sec-fallback__${sec.id}`,
        target: sec.default_next_section_id,
        targetHandle: `sec-target__${sec.default_next_section_id}`,
        label: 'Default Next',
        animated: false,
        style: { stroke: '#a855f7', strokeWidth: 2, strokeDasharray: '4,4' },
      })
    }
  }

  return edgeList
})

// Node Drag Stop event -> update position with debouncing
function handleNodeDragStop(e: NodeDragEvent) {
  if (e.node?.id && e.node.position) {
    updateNodePosition(e.node.id, e.node.position.x, e.node.position.y)
  }
}

// Connect Event -> create logic rule or fallback connection
async function handleConnect(params: Connection) {
  const sourceSectionId: string = params.source ? String(params.source) : ''
  const targetSectionId: string = params.target ? String(params.target) : ''

  if (!sourceSectionId || !targetSectionId) return
  if (sourceSectionId === targetSectionId) return

  const sourceHandle = params.sourceHandle ? String(params.sourceHandle) : ''

  // 1. Fallback Section Connection
  if (sourceHandle.startsWith('sec-fallback__')) {
    await updateSection(sourceSectionId, { default_next_section_id: targetSectionId })
    return
  }

  // 2. Choice Option Branching Connection
  if (sourceHandle.startsWith('opt-source__')) {
    const raw = sourceHandle.replace('opt-source__', '')
    const parts = raw.split('__')
    const questionId: string = parts[0] ?? ''
    const optionId: string = parts[1] ?? ''

    if (!questionId) return

    await createLogicRule({
      source_section_id: sourceSectionId,
      question_id: questionId,
      operator: 'selected',
      condition_value: optionId || null,
      target_section_id: targetSectionId,
    })
    return
  }

  // 3. Question Level Connection
  if (sourceHandle.startsWith('q-source__')) {
    const questionId: string = sourceHandle.replace('q-source__', '')
    if (!questionId) return

    const q = questions.value.find((item) => item.id === questionId)
    const operator: LogicOperator = q?.type === 'multiple_choice' ? 'selected' : 'filled'

    await createLogicRule({
      source_section_id: sourceSectionId,
      question_id: questionId,
      operator,
      condition_value: null,
      target_section_id: targetSectionId,
    })
  }
}

// Handle Edge Deletion (e.g. Backspace / Delete key pressed on selected edge)
async function handleEdgesChange(changes: Array<{ type: string; id?: string }>) {
  for (const c of changes) {
    if (c.type === 'remove' && c.id) {
      const edgeId = c.id
      if (edgeId.startsWith('logic-')) {
        const ruleId = edgeId.replace('logic-', '')
        await deleteLogicRule(ruleId)
      } else if (edgeId.startsWith('fallback-')) {
        const secId = edgeId.replace('fallback-', '')
        await updateSection(secId, { default_next_section_id: null })
      }
    }
  }
}

// Edge Click event -> open edit/delete modal
function handleEdgeClick(e: any) {
  const edgeObj: Edge | undefined = e?.edge || (e?.id ? e : undefined)
  if (!edgeObj || !edgeObj.id) return

  if (edgeObj.id.startsWith('logic-')) {
    const ruleId = edgeObj.id.replace('logic-', '')
    const rule = logicRules.value.find((r) => r.id === ruleId)
    if (rule) {
      selectedEdgeType.value = 'logic'
      activeLogicRule.value = rule
      activeQuestion.value = questions.value.find((q) => q.id === rule.question_id) || null
      editOperator.value = rule.operator as LogicOperator
      editConditionValue.value = typeof rule.condition_value === 'string' ? rule.condition_value : String(rule.condition_value || '')
      editTargetSectionId.value = rule.target_section_id
      isModalOpen.value = true
    }
  } else if (edgeObj.id.startsWith('fallback-')) {
    const secId = edgeObj.id.replace('fallback-', '')
    const sec = sections.value.find((s) => s.id === secId)
    if (sec) {
      selectedEdgeType.value = 'fallback'
      activeFallbackSection.value = sec
      editTargetSectionId.value = sec.default_next_section_id || ''
      isModalOpen.value = true
    }
  }
}

// Subscribe via useVueFlow to ensure 100% reliable edge click detection
onEdgeClick((e) => {
  handleEdgeClick(e)
})

async function handleDeleteSelectedEdge() {
  if (selectedEdgeType.value === 'logic' && activeLogicRule.value) {
    await deleteLogicRule(activeLogicRule.value.id)
  } else if (selectedEdgeType.value === 'fallback' && activeFallbackSection.value) {
    await updateSection(activeFallbackSection.value.id, { default_next_section_id: null })
  }
  isModalOpen.value = false
}

async function handleSaveLogicRule() {
  if (!activeLogicRule.value) return
  await updateLogicRule(activeLogicRule.value.id, {
    operator: editOperator.value,
    condition_value: editConditionValue.value || null,
    target_section_id: editTargetSectionId.value,
  })
  isModalOpen.value = false
}

async function handleSaveFallbackSection() {
  if (!activeFallbackSection.value) return
  await updateSection(activeFallbackSection.value.id, {
    default_next_section_id: editTargetSectionId.value || null,
  })
  isModalOpen.value = false
}
</script>
