<template>
  <div class="space-y-6">
    <!-- Survey Header & Cover Photo Settings Card -->
    <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
      <!-- Cover Banner Container (Facebook / LinkedIn Style) -->
      <div v-if="survey?.cover_image_url" class="relative w-full h-44 sm:h-56 overflow-hidden bg-gray-100 dark:bg-gray-800 group">
        <img
          :src="survey.cover_image_url"
          alt="Survey Sampul Header"
          class="w-full h-full object-cover"
        />
        <!-- Overlay & Hover Actions -->
        <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-3">
          <UButton
            color="neutral"
            variant="solid"
            icon="i-heroicons-arrow-path"
            size="xs"
            @click="triggerFileInput"
          >
            Ganti Sampul
          </UButton>
          <UButton
            color="neutral"
            variant="solid"
            icon="i-heroicons-link"
            size="xs"
            @click="showUrlInput = !showUrlInput"
          >
            Input URL
          </UButton>
          <UButton
            color="error"
            variant="solid"
            icon="i-heroicons-trash"
            size="xs"
            @click="handleRemoveCover"
          >
            Hapus Sampul
          </UButton>
        </div>
      </div>

      <!-- Cover Placeholder / Upload Dropzone when no cover image exists -->
      <div v-else class="p-6 text-center border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
        <div class="max-w-md mx-auto space-y-3">
          <div class="w-10 h-10 rounded-full bg-primary-50 dark:bg-primary-950/50 text-primary-500 flex items-center justify-center mx-auto">
            <UIcon name="i-heroicons-photo" class="w-5 h-5" />
          </div>
          <div>
            <h4 class="text-xs font-semibold text-gray-700 dark:text-gray-300">Gambar Heading / Sampul Survei</h4>
            <p class="text-2xs text-gray-500 mt-0.5">Tambahkan foto sampul bergaya Facebook/LinkedIn di atas judul survei Anda.</p>
          </div>
          <div class="flex items-center justify-center gap-2 pt-1">
            <UButton
              color="primary"
              variant="soft"
              icon="i-heroicons-cloud-arrow-up"
              size="xs"
              @click="triggerFileInput"
            >
              Upload Sampul
            </UButton>
            <UButton
              color="neutral"
              variant="ghost"
              icon="i-heroicons-link"
              size="xs"
              @click="showUrlInput = !showUrlInput"
            >
              Gunakan URL Gambar
            </UButton>
          </div>
        </div>
      </div>

      <!-- URL Input Bar -->
      <div v-if="showUrlInput" class="p-3 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center space-x-2">
        <UInput
          v-model="inputImageUrl"
          placeholder="https://example.com/gambar-sampul.jpg"
          size="xs"
          class="flex-1"
          @keyup.enter="handleApplyImageUrl"
        />
        <UButton color="primary" size="xs" @click="handleApplyImageUrl">Simpan URL</UButton>
        <UButton color="neutral" variant="ghost" size="xs" @click="showUrlInput = false">Batal</UButton>
      </div>

      <!-- Hidden File Input for Image Upload -->
      <input
        ref="fileInputRef"
        type="file"
        accept="image/*"
        class="hidden"
        @change="handleFileUpload"
      />

      <!-- Title & Description Editor -->
      <div class="p-5 space-y-4">
        <div>
          <label class="block text-2xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
            Judul Utama Survei
          </label>
          <UInput
            :model-value="survey?.title || ''"
            placeholder="Masukkan Judul Survei..."
            size="md"
            class="w-full font-bold text-gray-900 dark:text-white"
            @change="(e: Event) => onSaveSurveyTitle((e.target as HTMLInputElement)?.value || '')"
          />
        </div>

        <div>
          <label class="block text-2xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
            Deskripsi Survei
          </label>
          <UTextarea
            :model-value="survey?.description || ''"
            placeholder="Masukkan deskripsi atau penjelasan survei..."
            size="xs"
            rows="2"
            class="w-full"
            @change="(e: Event) => onSaveSurveyDescription((e.target as HTMLTextAreaElement)?.value || '')"
          />
        </div>
      </div>
    </div>

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
          size="sm"
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
              <UBadge v-if="survey?.start_section_id === sec.id" color="success" variant="soft" size="sm">
                Start Section
              </UBadge>
              <UBadge v-if="sec.is_end_section" color="warning" variant="soft" size="sm">
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
            color="success"
            variant="ghost"
            icon="i-heroicons-flag"
            @click="setStartSection(sec.id)"
          >
            Jadikan Start
          </UButton>

          <!-- End Section Toggle Button -->
          <UButton
            size="xs"
            :color="sec.is_end_section ? 'warning' : 'neutral'"
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
              @change="(e: Event) => onSaveSectionTitle(sec.id, (e.target as HTMLInputElement)?.value || '')"
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
              @change="(e: Event) => onSaveSectionDescription(sec.id, (e.target as HTMLInputElement)?.value || '')"
            />
          </div>

          <div>
            <label class="block text-2xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
              Fallback "What Next?" Section
            </label>
            <select
              :value="sec.default_next_section_id || ''"
              class="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-2.5 py-1.5 text-xs text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none transition-colors cursor-pointer"
              @change="(e: Event) => onSaveFallbackSection(sec.id, (e.target as HTMLSelectElement)?.value || '')"
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
import { ref, computed } from 'vue'
import { useSurveyBuilder, type SectionRow } from '~/composables/useSurveyBuilder'
import QuestionEditor from '~/components/survey/QuestionEditor.vue'

const toast = useToast()
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
  updateSurveyHeader,
} = useSurveyBuilder()

const fileInputRef = ref<HTMLInputElement | null>(null)
const showUrlInput = ref(false)
const inputImageUrl = ref('')

const collapsedSections = ref<Record<string, boolean>>({})

function triggerFileInput() {
  fileInputRef.value?.click()
}

function handleFileUpload(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  if (file.size > 5 * 1024 * 1024) {
    toast.add({
      title: 'Ukuran File Terlalu Besar',
      description: 'Maksimal ukuran file gambar sampul adalah 5MB.',
      color: 'error',
      icon: 'i-heroicons-exclamation-triangle',
    })
    return
  }

  const reader = new FileReader()
  reader.onload = async (e) => {
    const dataUrl = e.target?.result as string
    if (dataUrl) {
      const success = await updateSurveyHeader({ cover_image_url: dataUrl })
      if (success) {
        toast.add({
          title: 'Sampul Diperbarui',
          description: 'Gambar sampul survei berhasil diunggah.',
          color: 'success',
          icon: 'i-heroicons-check-circle',
        })
      }
    }
  }
  reader.readAsDataURL(file)
}

async function handleApplyImageUrl() {
  if (!inputImageUrl.value || !inputImageUrl.value.trim()) return
  const success = await updateSurveyHeader({ cover_image_url: inputImageUrl.value.trim() })
  if (success) {
    toast.add({
      title: 'Sampul Diperbarui',
      description: 'URL gambar sampul berhasil diterapkan.',
      color: 'success',
      icon: 'i-heroicons-check-circle',
    })
    showUrlInput.value = false
    inputImageUrl.value = ''
  }
}

async function handleRemoveCover() {
  const success = await updateSurveyHeader({ cover_image_url: null })
  if (success) {
    toast.add({
      title: 'Sampul Dihapus',
      description: 'Gambar sampul survei telah dihapus.',
      color: 'info',
      icon: 'i-heroicons-information-circle',
    })
  }
}

async function onSaveSurveyTitle(title: string) {
  if (title && title.trim()) {
    await updateSurveyHeader({ title: title.trim() })
  }
}

async function onSaveSurveyDescription(description: string) {
  await updateSurveyHeader({ description: description.trim() || null })
}

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
