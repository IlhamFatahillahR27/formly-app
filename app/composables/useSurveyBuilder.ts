import type { Database, Json } from '~/types/supabase'

export type SurveyRow = Database['public']['Tables']['surveys']['Row']
export type SectionRow = Database['public']['Tables']['sections']['Row']
export type QuestionRow = Database['public']['Tables']['questions']['Row']
export type SectionLogicRow = Database['public']['Tables']['section_logic']['Row']

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

  const survey = useState<SurveyRow | null>('builder_survey', () => null)
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

      // 3. Fetch questions ordered by order_index
      const sectionIds = (sections.value || []).map((s) => s.id)
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
    // Immediate local state update for smooth canvas rendering
    const secIndex = sections.value.findIndex((s) => s.id === sectionId)
    if (secIndex !== -1) {
      sections.value[secIndex] = {
        ...sections.value[secIndex],
        position_x,
        position_y,
      }
    }

    // Clear existing timer if any
    if (positionDebounceTimers[sectionId]) {
      clearTimeout(positionDebounceTimers[sectionId])
    }

    // Debounced update to Supabase
    positionDebounceTimers[sectionId] = setTimeout(async () => {
      delete positionDebounceTimers[sectionId]
      try {
        await supabase
          .from('sections')
          .update({ position_x, position_y })
          .eq('id', sectionId)
      } catch (err) {
        console.error('Failed to save node position:', err)
      }
    }, 500)
  }

  /**
   * Create a new Section
   */
  async function createSection(payload?: { title?: string; description?: string }): Promise<SectionRow | null> {
    if (!survey.value) return null

    saving.value = true
    error.value = null

    const newOrderIndex = sections.value.length
    const defaultTitle = payload?.title || `Section ${newOrderIndex + 1}`
    const lastSection = sections.value[sections.value.length - 1]
    const defaultX = lastSection ? lastSection.position_x + 320 : 100
    const defaultY = lastSection ? lastSection.position_y : 100

    try {
      const { data, error: secErr } = await supabase
        .from('sections')
        .insert({
          survey_id: survey.value.id,
          title: defaultTitle,
          description: payload?.description || null,
          position_x: defaultX,
          position_y: defaultY,
          order_index: newOrderIndex,
        })
        .select()
        .single()

      if (secErr || !data) {
        error.value = secErr?.message || 'Gagal membuat section baru.'
        saving.value = false
        return null
      }

      sections.value = [...sections.value, data]

      // If survey has no start section, set this one
      if (!survey.value.start_section_id) {
        await setStartSection(data.id)
      }

      saving.value = false
      return data
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Kesalahan membuat section.'
      saving.value = false
      return null
    }
  }

  /**
   * Update an existing section
   */
  async function updateSection(sectionId: string, payload: Partial<SectionRow>): Promise<boolean> {
    saving.value = true
    error.value = null

    try {
      const { data, error: secErr } = await supabase
        .from('sections')
        .update(payload)
        .eq('id', sectionId)
        .select()
        .single()

      if (secErr || !data) {
        error.value = secErr?.message || 'Gagal memperbarui section.'
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
      error.value = err instanceof Error ? err.message : 'Kesalahan memperbarui section.'
      saving.value = false
      return false
    }
  }

  /**
   * Delete a section
   */
  async function deleteSection(sectionId: string): Promise<boolean> {
    if (sections.value.length <= 1) {
      error.value = 'Survei harus memiliki minimal 1 section.'
      return false
    }

    saving.value = true
    error.value = null

    try {
      const { error: delErr } = await supabase
        .from('sections')
        .delete()
        .eq('id', sectionId)

      if (delErr) {
        error.value = delErr.message
        saving.value = false
        return false
      }

      sections.value = sections.value.filter((s) => s.id !== sectionId)
      questions.value = questions.value.filter((q) => q.section_id !== sectionId)
      logicRules.value = logicRules.value.filter(
        (l) => l.source_section_id !== sectionId && l.target_section_id !== sectionId
      )

      // If start_section_id was deleted, fallback to first available section
      if (survey.value?.start_section_id === sectionId && sections.value.length > 0) {
        await setStartSection(sections.value[0].id)
      }

      saving.value = false
      return true
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Kesalahan menghapus section.'
      saving.value = false
      return false
    }
  }

  /**
   * Set start section ID for survey
   */
  async function setStartSection(sectionId: string): Promise<boolean> {
    if (!survey.value) return false

    try {
      const { data, error: updateErr } = await supabase
        .from('surveys')
        .update({ start_section_id: sectionId })
        .eq('id', survey.value.id)
        .select()
        .single()

      if (updateErr || !data) {
        error.value = updateErr?.message || 'Gagal mengubah start section.'
        return false
      }

      survey.value = data
      return true
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Kesalahan mengubah start section.'
      return false
    }
  }

  /**
   * Create a new question inside a section
   */
  async function createQuestion(
    sectionId: string,
    payload?: {
      question_text?: string
      type?: QuestionType
      is_required?: boolean
      options?: Json
    }
  ): Promise<QuestionRow | null> {
    saving.value = true
    error.value = null

    const sectionQuestions = questions.value.filter((q) => q.section_id === sectionId)
    const newOrderIndex = sectionQuestions.length

    const defaultOptions: QuestionOption[] = payload?.type === 'multiple_choice'
      ? [
          { id: 'opt_1', text: 'Opsi 1' },
          { id: 'opt_2', text: 'Opsi 2' },
        ]
      : []

    try {
      const { data, error: qErr } = await supabase
        .from('questions')
        .insert({
          section_id: sectionId,
          question_text: payload?.question_text || 'Pertanyaan Baru',
          type: payload?.type || 'short_text',
          is_required: payload?.is_required ?? true,
          options: (payload?.options as Json) ?? (defaultOptions.length > 0 ? (defaultOptions as unknown as Json) : null),
          order_index: newOrderIndex,
        })
        .select()
        .single()

      if (qErr || !data) {
        error.value = qErr?.message || 'Gagal membuat pertanyaan baru.'
        saving.value = false
        return null
      }

      questions.value = [...questions.value, data]
      saving.value = false
      return data
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Kesalahan membuat pertanyaan.'
      saving.value = false
      return null
    }
  }

  /**
   * Update an existing question
   */
  async function updateQuestion(questionId: string, payload: Partial<QuestionRow>): Promise<boolean> {
    saving.value = true
    error.value = null

    try {
      const { data, error: qErr } = await supabase
        .from('questions')
        .update(payload)
        .eq('id', questionId)
        .select()
        .single()

      if (qErr || !data) {
        error.value = qErr?.message || 'Gagal memperbarui pertanyaan.'
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
      error.value = err instanceof Error ? err.message : 'Kesalahan memperbarui pertanyaan.'
      saving.value = false
      return false
    }
  }

  /**
   * Delete a question
   */
  async function deleteQuestion(questionId: string): Promise<boolean> {
    saving.value = true
    error.value = null

    try {
      const { error: delErr } = await supabase
        .from('questions')
        .delete()
        .eq('id', questionId)

      if (delErr) {
        error.value = delErr.message
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
   * Create or replace a section_logic rule
   */
  async function createLogicRule(payload: {
    source_section_id: string
    question_id: string
    operator: LogicOperator
    condition_value?: Json
    target_section_id: string
  }): Promise<SectionLogicRow | null> {
    if (!survey.value) return null

    saving.value = true
    error.value = null

    try {
      const { data, error: logicErr } = await supabase
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

      if (logicErr || !data) {
        error.value = logicErr?.message || 'Gagal menambahkan aturan alur logika.'
        saving.value = false
        return null
      }

      logicRules.value = [...logicRules.value, data]
      saving.value = false
      return data
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Kesalahan menambahkan aturan alur.'
      saving.value = false
      return null
    }
  }

  /**
   * Delete a section logic rule
   */
  async function deleteLogicRule(ruleId: string): Promise<boolean> {
    saving.value = true
    error.value = null

    try {
      const { error: delErr } = await supabase
        .from('section_logic')
        .delete()
        .eq('id', ruleId)

      if (delErr) {
        error.value = delErr.message
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
    deleteLogicRule,
  }
}
