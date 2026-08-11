<template>
  <div class="w-full h-[650px] relative rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-900 overflow-hidden">
    <VueFlow
      v-model:nodes="nodes"
      v-model:edges="edges"
      :default-viewport="{ zoom: 0.9, x: 50, y: 50 }"
      :min-zoom="0.2"
      :max-zoom="2"
      fit-view-on-init
      class="w-full h-full"
      @node-drag-stop="handleNodeDragStop"
      @connect="handleConnect"
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
      <div class="text-gray-500">| Geser node untuk memicu simpan otomatis</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { VueFlow, type Node, type Edge, type Connection, type NodeDragEvent } from '@vue-flow/core'
import { Background, Controls, MiniMap, PanelPosition } from '@vue-flow/additional-components'

import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'

import SectionNode from '~/components/builder/nodes/SectionNode.vue'
import { useSurveyBuilder, type QuestionRow, type LogicOperator } from '~/composables/useSurveyBuilder'

const {
  survey,
  sections,
  questions,
  logicRules,
  updateNodePosition,
  updateSection,
  createLogicRule,
} = useSurveyBuilder()

const collapsedSections = ref<Record<string, boolean>>({})

function handleToggleCollapse(sectionId: string) {
  collapsedSections.value[sectionId] = !collapsedSections.value[sectionId]
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
    let sourceHandle = `q-source-${rule.question_id}`

    if (q?.type === 'multiple_choice' && rule.condition_value) {
      const condVal = typeof rule.condition_value === 'string' ? rule.condition_value : String(rule.condition_value)
      sourceHandle = `opt-source-${rule.question_id}-${condVal}`
    }

    edgeList.push({
      id: `logic-${rule.id}`,
      source: rule.source_section_id,
      sourceHandle,
      target: rule.target_section_id,
      targetHandle: `sec-target-${rule.target_section_id}`,
      label: `${rule.operator} ${rule.condition_value || ''}`,
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
        sourceHandle: `sec-fallback-${sec.id}`,
        target: sec.default_next_section_id,
        targetHandle: `sec-target-${sec.default_next_section_id}`,
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

  const sourceHandle = params.sourceHandle ? String(params.sourceHandle) : ''

  // 1. Fallback Section Connection
  if (sourceHandle.startsWith('sec-fallback-')) {
    await updateSection(sourceSectionId, { default_next_section_id: targetSectionId })
    return
  }

  // 2. Choice Option Branching Connection
  if (sourceHandle.startsWith('opt-source-')) {
    const parts = sourceHandle.replace('opt-source-', '').split('-')
    const questionId: string = parts[0] ?? ''
    const optionId: string = parts.slice(1).join('-')

    await createLogicRule({
      source_section_id: sourceSectionId,
      question_id: questionId,
      operator: 'selected',
      condition_value: optionId,
      target_section_id: targetSectionId,
    })
    return
  }

  // 3. Question Level Connection
  if (sourceHandle.startsWith('q-source-')) {
    const questionId: string = sourceHandle.replace('q-source-', '')
    const q = questions.value.find((item) => item.id === questionId)
    const operator: LogicOperator = q?.type === 'multiple_choice' ? 'selected' : 'filled'

    await createLogicRule({
      source_section_id: sourceSectionId,
      question_id: questionId,
      operator,
      target_section_id: targetSectionId,
    })
  }
}
</script>
