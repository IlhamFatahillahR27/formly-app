<template>
  <div class="space-y-6">
    <div v-if="sections.length === 0" class="p-8 text-center border-2 border-dashed border-gray-300 dark:border-gray-800 rounded-xl bg-white dark:bg-gray-900">
      <UIcon name="i-heroicons-document-text" class="w-12 h-12 text-gray-400 mx-auto mb-2" />
      <h3 class="font-semibold text-gray-900 dark:text-white">Belum Ada Section</h3>
      <p class="text-xs text-gray-500 mb-4">Tambahkan section pertama untuk mulai membuat pertanyaan.</p>
      <UButton color="primary" icon="i-heroicons-plus" @click="handleAddSection">
        Tambah Section Pertama
      </UButton>
    </div>

    <!-- Sections Control Header Toolbar -->
    <div v-if="sections.length > 0" class="flex items-center justify-between px-1">
      <div class="text-xs text-gray-500 flex items-center space-x-2">
        <UIcon name="i-heroicons-squares-2x2" class="w-4 h-4 text-primary-500" />
        <span>Total: <strong>{{ sections.length }} Section</strong> ({{ questions.length }} Pertanyaan)</span>
      </div>

      <div class="flex items-center space-x-2">
        <UButton
          size="2xs"
          color="secondary"
          variant="ghost"
          :icon="allCollapsed ? 'i-heroicons-arrows-pointing-out' : 'i-heroicons-arrows-pointing-in'"
          @click="toggleAllSections"
        >
          {{ allCollapsed ? 'Expand Semua Section' : 'Collapse Semua Section' }}
        </UButton>
      </div>
    </div>

    <!-- Sections List -->
    <div
      v-for="(sec, sIdx) in sections"
      :key="sec.id"
      class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden"
    >
      <!-- Section Header -->
      <div class="p-4 bg-gray-50/80 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800 flex flex-wrap items-center justify-between gap-3">
        <div class="flex items-center space-x-3">
          <UButton
            size="xs"
            color="secondary"
            variant="ghost"
            :icon="collapsedSections[sec.id] ? 'i-heroicons-chevron-right' : 'i-heroicons-chevron-down'"
            @click="collapsedSections[sec.id] = !collapsedSections[sec.id]"
          />

          <div class="flex items-center justify-center w-8 h-8 rounded-lg bg-primary-500/10 text-primary-600 dark:text-primary-400 font-bold text-sm">
            {{ sIdx + 1 }}
          </div>
          <div>
            <div class="flex items-center space-x-2">
              <h3 class="font-bold text-gray-900 dark:text-white text-base">
                {{ sec.title }}
              </h3>
              <UBadge v-if="survey?.start_section_id === sec.id" color="emerald" variant="soft" size="xs">
                Start Section
              </UBadge>
              <UBadge v-if="sec.is_end_section" color="amber" variant="soft" size="xs">
                End Section
              </UBadge>
            </div>
            <p v-if="sec.description" class="text-xs text-gray-500 mt-0.5">
              {{ sec.description }}
            </p>
          </div>
        </div>

        <div class="flex items-center space-x-2">
          <!-- Start Section Toggle Button -->
          <UButton
            v-if="survey?.start_section_id !== sec.id"
            size="xs"
            color="emerald"
            variant="ghost"
            icon="i-heroicons-flag"
            @click="setStartSection(sec.id)"
          >
            Jadikan Start
          </UButton>

          <!-- End Section Toggle Button -->
          <UButton
            size="xs"
            :color="sec.is_end_section ? 'amber' : 'gray'"
            variant="ghost"
            :icon="sec.is_end_section ? 'i-heroicons-check-circle' : 'i-heroicons-stop'"
            @click="toggleEndSection(sec)"
          >
            {{ sec.is_end_section ? 'Akhir Survei' : 'Tandai Akhir' }}
          </UButton>

          <!-- Delete Section Button -->
          <UButton
            size="xs"
            color="error"
            variant="ghost"
            icon="i-heroicons-trash"
            @click="onDeleteSection(sec.id)"
          />
        </div>
      </div>

      <!-- Collapsible Body Content -->
      <div v-if="!collapsedSections[sec.id]">
        <!-- Section Details Form (Title, Description, Fallback Next Section) -->
        <div class="p-4 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-2xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
              Judul Section
            </label>
            <UInput
              :model-value="sec.title"
              size="xs"
              class="w-full"
              @change="(e: Event) => onSaveSectionTitle(sec.id, (e.target as HTMLInputElement).value)"
            />
          </div>

          <div>
            <label class="block text-2xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
              Deskripsi Section
            </label>
            <UInput
              :model-value="sec.description || ''"
              placeholder="Deskripsi opsional..."
              size="xs"
              class="w-full"
              @change="(e: Event) => onSaveSectionDescription(sec.id, (e.target as HTMLInputElement).value)"
            />
          </div>

          <div>
            <label class="block text-2xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
              Fallback "What Next?" Section
            </label>
            <select
              :value="sec.default_next_section_id || ''"
              class="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-2.5 py-1.5 text-xs text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none transition-colors cursor-pointer"
              @change="(e: Event) => onSaveFallbackSection(sec.id, (e.target as HTMLSelectElement).value)"
            >
              <option
                v-for="opt in getFallbackOptions(sec.id)"
                :key="opt.value"
                :value="opt.value"
              >
                {{ opt.label }}
              </option>
            </select>
          </div>
        </div>

        <!-- Questions List Inside Section -->
        <div class="p-4 bg-gray-50/40 dark:bg-gray-950/20 space-y-4">
          <div class="flex items-center justify-between">
            <h4 class="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              Pertanyaan ({{ getSectionQuestions(sec.id).length }})
            </h4>
            <UButton
              size="xs"
              color="primary"
              variant="soft"
              icon="i-heroicons-plus"
              @click="handleAddQuestion(sec.id)"
            >
              Tambah Pertanyaan
            </UButton>
          </div>

          <div v-if="getSectionQuestions(sec.id).length === 0" class="text-center py-6 text-xs text-gray-400 border border-dashed border-gray-200 dark:border-gray-800 rounded-lg">
            Belum ada pertanyaan di section ini. Klik tombol 'Tambah Pertanyaan' di atas.
          </div>

          <QuestionEditor
            v-for="(q, qIdx) in getSectionQuestions(sec.id)"
            :key="q.id"
            :question="q"
            :index="qIdx"
            :sections="sections"
            :logic-rules="logicRules"
          />
        </div>
      </div>
    </div>

    <!-- Bottom Add Section Bar -->
    <div class="flex justify-center pt-2">
      <UButton
        color="primary"
        variant="solid"
        icon="i-heroicons-plus-circle"
        size="md"
        @click="handleAddSection"
      >
        Tambah Section Baru
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSurveyBuilder, type SectionRow } from '~/composables/useSurveyBuilder'
import QuestionEditor from '~/components/survey/QuestionEditor.vue'

const {
  survey,
  sections,
  questions,
  logicRules,
  createSection,
  updateSection,
  deleteSection,
  setStartSection,
  createQuestion,
} = useSurveyBuilder()

const collapsedSections = ref<Record<string, boolean>>({})

const allCollapsed = computed(() => {
  if (sections.value.length === 0) return false
  return sections.value.every((s) => collapsedSections.value[s.id])
})

function toggleAllSections() {
  const targetState = !allCollapsed.value
  sections.value.forEach((s) => {
    collapsedSections.value[s.id] = targetState
  })
}

function getSectionQuestions(sectionId: string) {
  return questions.value.filter((q) => q.section_id === sectionId)
}

function getFallbackOptions(currentSectionId: string) {
  const opts = sections.value
    .filter((s) => s.id !== currentSectionId)
    .map((s) => ({
      value: s.id,
      label: s.title,
    }))

  return [{ value: '', label: '-- Selesai / Tanpa Fallback --' }, ...opts]
}

async function handleAddSection() {
  await createSection()
}

async function onDeleteSection(sectionId: string) {
  await deleteSection(sectionId)
}

async function toggleEndSection(sec: SectionRow) {
  await updateSection(sec.id, { is_end_section: !sec.is_end_section })
}

async function onSaveSectionTitle(sectionId: string, title: string) {
  if (title && title.trim()) {
    await updateSection(sectionId, { title: title.trim() })
  }
}

async function onSaveSectionDescription(sectionId: string, description: string) {
  await updateSection(sectionId, { description: description.trim() || null })
}

async function onSaveFallbackSection(sectionId: string, targetId: string) {
  await updateSection(sectionId, { default_next_section_id: targetId || null })
}

async function handleAddQuestion(sectionId: string) {
  await createQuestion(sectionId)
}
</script>
