import type { Database, Json, SurveyRow, SectionRow, QuestionRow, SectionLogicRow } from '~/types/supabase'

export type BuilderSurveyRow = SurveyRow
export type { SectionRow, QuestionRow, SectionLogicRow }

export type QuestionType = 'short_text' | 'long_text' | 'multiple_choice' | 'rating'
export type LogicOperator = 'selected' | 'filled' | 'equals' | 'not_equals' | 'greater_than' | 'less_than'


export interface QuestionOption {
  id: string
  text: string
}

// Debounce timer store per section ID
const positionDebounceTimers: Record<string, ReturnType<typeof setTimeout>> = {}

export function useSurveyBuilder() {
  const supabase = useSupabaseClient<Database>()

  const survey = useState<BuilderSurveyRow | null>('builder_survey', () => null)
  const sections = useState<SectionRow[]>('builder_sections', () => [])
  const questions = useState<QuestionRow[]>('builder_questions', () => [])
  const logicRules = useState<SectionLogicRow[]>('builder_logic_rules', () => [])

  const loading = useState<boolean>('builder_loading', () => false)
  const saving = useState<boolean>('builder_saving', () => false)
  const error = useState<string | null>('builder_error', () => null)

  /**
   * Load entire survey structure (Survey, Sections, Questions, Section Logic)
   */
  async function loadSurveyData(surveyId: string): Promise<boolean> {
    if (!surveyId) {
      error.value = 'ID Survei tidak valid.'
      return false
    }

    loading.value = true
    error.value = null

    try {
      // 1. Fetch survey header
      const { data: surveyData, error: surveyErr } = await supabase
        .from('surveys')
        .select('*')
        .eq('id', surveyId)
        .single()

      if (surveyErr || !surveyData) {
        error.value = surveyErr?.message || 'Survei tidak ditemukan.'
        loading.value = false
        return false
      }
      survey.value = surveyData

      // 2. Fetch sections ordered by order_index
      const { data: sectionsData, error: sectionsErr } = await supabase
        .from('sections')
        .select('*')
        .eq('survey_id', surveyId)
        .order('order_index', { ascending: true })

      if (sectionsErr) {
        error.value = sectionsErr.message
        loading.value = false
        return false
      }
      sections.value = sectionsData || []

      // 3. Fetch questions belonging to this survey's sections
      const sectionIds = sections.value.map((s) => s.id)
      if (sectionIds.length > 0) {
        const { data: questionsData, error: questionsErr } = await supabase
          .from('questions')
          .select('*')
          .in('section_id', sectionIds)
          .order('order_index', { ascending: true })

        if (questionsErr) {
          error.value = questionsErr.message
          loading.value = false
          return false
        }
        questions.value = questionsData || []
      } else {
        questions.value = []
      }

      // 4. Fetch section logic rules
      const { data: logicData, error: logicErr } = await supabase
        .from('section_logic')
        .select('*')
        .eq('survey_id', surveyId)

      if (logicErr) {
        error.value = logicErr.message
        loading.value = false
        return false
      }
      logicRules.value = logicData || []

      loading.value = false
      return true
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Gagal memuat data survei.'
      loading.value = false
      return false
    }
  }

  /**
   * Update section canvas position with debounce (500ms)
   */
  function updateNodePosition(sectionId: string, position_x: number, position_y: number) {
    const secIndex = sections.value.findIndex((s) => s.id === sectionId)
    const currentSec = sections.value[secIndex]
    if (secIndex !== -1 && currentSec) {
      sections.value[secIndex] = {
        ...currentSec,
        position_x,
        position_y,
      }
    }

    if (positionDebounceTimers[sectionId]) {
      clearTimeout(positionDebounceTimers[sectionId])
    }

    positionDebounceTimers[sectionId] = setTimeout(async () => {
      delete positionDebounceTimers[sectionId]
      try {
        await supabase
          .from('sections')
          .update({ position_x, position_y })
          .eq('id', sectionId)
      } catch (err) {
        console.error('Failed to update node position:', err)
      }
    }, 500)
  }

  /**
   * Create a new Section
   */
  async function createSection(
    titleOrPayload?: string | { title?: string }
  ): Promise<SectionRow | null> {
    if (!survey.value) return null
    saving.value = true

    const newIndex = sections.value.length
    let defaultTitle = `Section ${newIndex + 1}`

    if (typeof titleOrPayload === 'string' && titleOrPayload.trim()) {
      defaultTitle = titleOrPayload.trim()
    } else if (typeof titleOrPayload === 'object' && titleOrPayload !== null && 'title' in titleOrPayload && typeof titleOrPayload.title === 'string' && titleOrPayload.title.trim()) {
      defaultTitle = titleOrPayload.title.trim()
    }

    try {
      const { data, error: err } = await supabase
        .from('sections')
        .insert({
          survey_id: survey.value.id,
          title: defaultTitle,
          position_x: 100 + newIndex * 280,
          position_y: 100,
          order_index: newIndex,
        })
        .select()
        .single()

      if (err || !data) {
        error.value = err?.message || 'Gagal membuat section baru.'
        saving.value = false
        return null
      }

      sections.value.push(data)

      if (!survey.value.start_section_id) {
        await setStartSection(data.id)
      }

      saving.value = false
      return data
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Kesalahan saat membuat section.'
      saving.value = false
      return null
    }
  }

  /**
   * Update Section details
   */
  async function updateSection(
    sectionId: string,
    updates: Partial<Omit<SectionRow, 'id' | 'survey_id' | 'created_at' | 'updated_at'>>
  ): Promise<boolean> {
    saving.value = true
    try {
      const { data, error: err } = await supabase
        .from('sections')
        .update(updates)
        .eq('id', sectionId)
        .select()
        .single()

      if (err || !data) {
        error.value = err?.message || 'Gagal mengedit section.'
        saving.value = false
        return false
      }

      const idx = sections.value.findIndex((s) => s.id === sectionId)
      if (idx !== -1) {
        sections.value[idx] = data
      }

      saving.value = false
      return true
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Kesalahan saat mengupdate section.'
      saving.value = false
      return false
    }
  }

  /**
   * Delete Section
   */
  async function deleteSection(sectionId: string): Promise<boolean> {
    saving.value = true
    try {
      const { error: err } = await supabase
        .from('sections')
        .delete()
        .eq('id', sectionId)

      if (err) {
        error.value = err.message
        saving.value = false
        return false
      }

      sections.value = sections.value.filter((s) => s.id !== sectionId)
      questions.value = questions.value.filter((q) => q.section_id !== sectionId)
      logicRules.value = logicRules.value.filter(
        (l) => l.source_section_id !== sectionId && l.target_section_id !== sectionId
      )

      if (survey.value?.start_section_id === sectionId) {
        const nextStart = sections.value[0]?.id || null
        await setStartSection(nextStart)
      }

      saving.value = false
      return true
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Kesalahan saat menghapus section.'
      saving.value = false
      return false
    }
  }

  /**
   * Set Survey Start Section
   */
  async function setStartSection(sectionId: string | null): Promise<boolean> {
    if (!survey.value) return false
    saving.value = true

    try {
      const { error: err } = await supabase
        .from('surveys')
        .update({ start_section_id: sectionId })
        .eq('id', survey.value.id)

      if (err) {
        error.value = err.message
        saving.value = false
        return false
      }

      survey.value.start_section_id = sectionId
      saving.value = false
      return true
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Gagal mengubah start section.'
      saving.value = false
      return false
    }
  }

  /**
   * Create Question inside a Section
   */
  async function createQuestion(
    sectionId: string,
    typeOrPayload: QuestionType | { question_text?: string; type?: QuestionType } = 'short_text'
  ): Promise<QuestionRow | null> {
    saving.value = true
    const sectionQuestions = questions.value.filter((q) => q.section_id === sectionId)
    const newIndex = sectionQuestions.length

    let type: QuestionType = 'short_text'
    let questionText = 'Pertanyaan Baru'

    if (typeof typeOrPayload === 'string') {
      type = typeOrPayload
    } else if (typeof typeOrPayload === 'object' && typeOrPayload !== null) {
      if (typeOrPayload.type) type = typeOrPayload.type
      if (typeOrPayload.question_text) questionText = typeOrPayload.question_text
    }

    let defaultOptions: Json | null = null
    if (type === 'multiple_choice') {
      defaultOptions = [
        { id: 'opt_1', text: 'Opsi 1' },
        { id: 'opt_2', text: 'Opsi 2' },
      ]
    } else if (type === 'rating') {
      defaultOptions = { max_rating: 5 }
    }

    try {
      const { data, error: err } = await supabase
        .from('questions')
        .insert({
          section_id: sectionId,
          question_text: questionText,
          type,
          is_required: true,
          options: defaultOptions,
          order_index: newIndex,
        })
        .select()
        .single()

      if (err || !data) {
        error.value = err?.message || 'Gagal menambahkan pertanyaan.'
        saving.value = false
        return null
      }

      questions.value.push(data)
      saving.value = false
      return data
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Kesalahan membuat pertanyaan.'
      saving.value = false
      return null
    }
  }

  /**
   * Update Question details
   */
  async function updateQuestion(
    questionId: string,
    updates: Partial<Omit<QuestionRow, 'id' | 'section_id' | 'created_at' | 'updated_at'>>
  ): Promise<boolean> {
    saving.value = true
    try {
      const { data, error: err } = await supabase
        .from('questions')
        .update(updates)
        .eq('id', questionId)
        .select()
        .single()

      if (err || !data) {
        error.value = err?.message || 'Gagal mengedit pertanyaan.'
        saving.value = false
        return false
      }

      const idx = questions.value.findIndex((q) => q.id === questionId)
      if (idx !== -1) {
        questions.value[idx] = data
      }

      saving.value = false
      return true
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Kesalahan mengupdate pertanyaan.'
      saving.value = false
      return false
    }
  }

  /**
   * Delete Question
   */
  async function deleteQuestion(questionId: string): Promise<boolean> {
    saving.value = true
    try {
      const { error: err } = await supabase
        .from('questions')
        .delete()
        .eq('id', questionId)

      if (err) {
        error.value = err.message
        saving.value = false
        return false
      }

      questions.value = questions.value.filter((q) => q.id !== questionId)
      logicRules.value = logicRules.value.filter((l) => l.question_id !== questionId)

      saving.value = false
      return true
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Kesalahan menghapus pertanyaan.'
      saving.value = false
      return false
    }
  }

  /**
   * Create Logic Branching Rule
   */
  async function createLogicRule(
    payload: Omit<SectionLogicRow, 'id' | 'created_at' | 'updated_at' | 'survey_id' | 'condition_value'> & { condition_value?: Json | null }
  ): Promise<SectionLogicRow | null> {
    if (!survey.value) return null
    saving.value = true

    try {
      const { data, error: err } = await supabase
        .from('section_logic')
        .insert({
          survey_id: survey.value.id,
          source_section_id: payload.source_section_id,
          question_id: payload.question_id,
          operator: payload.operator,
          condition_value: payload.condition_value ?? null,
          target_section_id: payload.target_section_id,
        })
        .select()
        .single()

      if (err || !data) {
        error.value = err?.message || 'Gagal membuat aturan logika.'
        saving.value = false
        return null
      }

      logicRules.value.push(data)
      saving.value = false
      return data
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Kesalahan membuat aturan logika.'
      saving.value = false
      return null
    }
  }

  /**
   * Delete Logic Rule
   */
  async function deleteLogicRule(ruleId: string): Promise<boolean> {
    saving.value = true
    try {
      const { error: err } = await supabase
        .from('section_logic')
        .delete()
        .eq('id', ruleId)

      if (err) {
        error.value = err.message
        saving.value = false
        return false
      }

      logicRules.value = logicRules.value.filter((l) => l.id !== ruleId)
      saving.value = false
      return true
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Kesalahan menghapus aturan logika.'
      saving.value = false
      return false
    }
  }

  /**
   * Update Logic Rule
   */
  async function updateLogicRule(
    ruleId: string,
    updates: Partial<Omit<SectionLogicRow, 'id' | 'survey_id' | 'created_at' | 'updated_at'>>
  ): Promise<boolean> {
    saving.value = true
    try {
      const { data, error: err } = await supabase
        .from('section_logic')
        .update(updates)
        .eq('id', ruleId)
        .select()
        .single()

      if (err || !data) {
        error.value = err?.message || 'Gagal mengedit aturan logika.'
        saving.value = false
        return false
      }

      const idx = logicRules.value.findIndex((l) => l.id === ruleId)
      if (idx !== -1) {
        logicRules.value[idx] = data
      }

      saving.value = false
      return true
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Kesalahan mengupdate aturan logika.'
      saving.value = false
      return false
    }
  }

  /**
   * Update survey active status directly from builder
   */
  async function toggleSurveyStatus(isActive: boolean): Promise<boolean> {
    if (!survey.value) return false
    saving.value = true
    try {
      const { error: err } = await supabase
        .from('surveys')
        .update({ is_active: isActive })
        .eq('id', survey.value.id)

      if (err) {
        error.value = err.message
        saving.value = false
        return false
      }

      survey.value.is_active = isActive
      saving.value = false
      return true
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Gagal memperbarui status survei.'
      saving.value = false
      return false
    }
  }

  /**
   * Update survey header metadata (title, description, cover_image_url)
   */
  async function updateSurveyHeader(updates: Partial<Pick<BuilderSurveyRow, 'title' | 'description' | 'cover_image_url'>>): Promise<boolean> {
    if (!survey.value) return false
    saving.value = true
    try {
      const { data, error: err } = await supabase
        .from('surveys')
        .update(updates)
        .eq('id', survey.value.id)
        .select()
        .single()

      if (err || !data) {
        error.value = err?.message || 'Gagal mengupdate informasi survei.'
        saving.value = false
        return false
      }

      survey.value = {
        ...survey.value,
        ...data,
      }
      saving.value = false
      return true
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Kesalahan mengupdate informasi survei.'
      saving.value = false
      return false
    }
  }

  return {
    survey,
    sections,
    questions,
    logicRules,
    loading,
    saving,
    error,
    loadSurveyData,
    updateNodePosition,
    createSection,
    updateSection,
    deleteSection,
    setStartSection,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    createLogicRule,
    updateLogicRule,
    deleteLogicRule,
    toggleSurveyStatus,
    updateSurveyHeader,
  }
}
