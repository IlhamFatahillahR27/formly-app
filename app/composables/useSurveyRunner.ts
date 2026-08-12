import { computed } from 'vue'
import type { Database } from '~/types/supabase'

type Survey = Database['public']['Tables']['surveys']['Row']
type Section = Database['public']['Tables']['sections']['Row']
type Question = Database['public']['Tables']['questions']['Row']
type SectionLogic = Database['public']['Tables']['section_logic']['Row']

export interface RunnerQuestionOption {
  id: string
  text: string
}

export interface SectionAnswerRecord {
  stepIndex: number
  sectionId: string
  iterationIndex: number
  questionId: string
  value: any
}

export function useSurveyRunner() {
  const supabase = useSupabaseClient<Database>()

  const survey = useState<Survey | null>('runner_survey', () => null)
  const sections = useState<Section[]>('runner_sections', () => [])
  const allQuestions = useState<Question[]>('runner_all_questions', () => [])
  const sectionLogics = useState<SectionLogic[]>('runner_logics', () => [])

  const currentSectionId = useState<string | null>('runner_current_section_id', () => null)
  const answers = useState<Record<string, any>>('runner_answers', () => ({}))
  const accumulatedRecords = useState<SectionAnswerRecord[]>('runner_accumulated_records', () => [])
  const navigationHistory = useState<string[]>('runner_nav_history', () => [])
  const completedCategories = useState<string[]>('runner_completed_categories', () => [])

  const isLoading = useState<boolean>('runner_is_loading', () => true)
  const isSubmitted = useState<boolean>('runner_is_submitted', () => false)
  const isSubmitting = useState<boolean>('runner_is_submitting', () => false)
  const errorMessage = useState<string | null>('runner_error_message', () => null)
  const validationErrors = useState<Record<string, string>>('runner_validation_errors', () => ({}))

  // Load Survey Metadata, Sections, Questions (with Session Resolution & Debug Logs), and Logic Rules
  async function loadSurveyAndSections(surveyId: string, isPreview = false) {
    isLoading.value = true
    errorMessage.value = null
    allQuestions.value = []
    sections.value = []

    console.log('[SurveyRunner Debug] Starting loadSurveyAndSections for surveyId:', surveyId, 'isPreview:', isPreview)

    try {
      // 0. Explicitly ensure Supabase Auth session is loaded
      try {
        const { data: sessionData } = await supabase.auth.getSession()
        console.log('[SurveyRunner Debug] Auth session user:', sessionData.session?.user?.email || 'Guest / Anon')
      } catch (authErr) {
        console.warn('[SurveyRunner Debug] Auth session error:', authErr)
      }

      // 1. Fetch survey metadata
      const { data: surveyData, error: surveyError } = await supabase
        .from('surveys')
        .select('*')
        .eq('id', surveyId)
        .single()

      if (surveyError || !surveyData) {
        console.error('[SurveyRunner Debug] Survey fetch error:', surveyError)
        throw new Error('Survei tidak ditemukan')
      }

      if (!surveyData.is_active && !isPreview) {
        throw new Error('Survei ini sedang tidak aktif')
      }

      survey.value = surveyData
      console.log('[SurveyRunner Debug] Survey loaded:', surveyData.title, 'is_active:', surveyData.is_active)

      // 2. Fetch sections ordered by order_index
      const { data: sectionData, error: sectionError } = await supabase
        .from('sections')
        .select('*')
        .eq('survey_id', surveyId)
        .order('order_index', { ascending: true })

      if (sectionError) {
        console.error('[SurveyRunner Debug] Sections fetch error:', sectionError)
        throw sectionError
      }

      const loadedSections: Section[] = sectionData || []
      sections.value = loadedSections
      console.log('[SurveyRunner Debug] Loaded sections count:', loadedSections.length, loadedSections)

      // 3. Fetch questions with multi-layer query strategy
      const sectionIds = loadedSections.map((s) => s.id)
      let loadedQuestions: Question[] = []

      if (sectionIds.length > 0) {
        console.log('[SurveyRunner Debug] Fetching questions for sectionIds:', sectionIds)
        // Query 1: Direct query on questions table by section_id IN sectionIds
        const { data: questionData, error: questionError } = await supabase
          .from('questions')
          .select('*')
          .in('section_id', sectionIds)
          .order('order_index', { ascending: true })

        if (questionError) {
          console.warn('[SurveyRunner Debug] Direct questions query error:', questionError)
        }

        if (!questionError && questionData && questionData.length > 0) {
          loadedQuestions = questionData
          console.log('[SurveyRunner Debug] Direct questions query returned count:', questionData.length, questionData)
        } else {
          console.log('[SurveyRunner Debug] Attempting Query 2 Fallback (Nested join on sections)')
          // Query 2 Fallback: PostgREST nested join on sections
          const { data: nestedData, error: nestedError } = await supabase
            .from('sections')
            .select(`
              id,
              questions (*)
            `)
            .eq('survey_id', surveyId)

          if (nestedError) {
            console.error('[SurveyRunner Debug] Nested join query error:', nestedError)
          }

          if (nestedData) {
            for (const sec of nestedData) {
              if (Array.isArray((sec as any).questions)) {
                loadedQuestions.push(...((sec as any).questions as Question[]))
              }
            }
            console.log('[SurveyRunner Debug] Nested join query extracted count:', loadedQuestions.length, loadedQuestions)
          }
        }
      }

      allQuestions.value = loadedQuestions
      console.log('[SurveyRunner Debug] Total allQuestions loaded into state:', allQuestions.value.length, allQuestions.value)

      // 4. Fetch logic rules
      const { data: logicData, error: logicError } = await supabase
        .from('section_logic')
        .select('*')
        .eq('survey_id', surveyId)

      if (!logicError && logicData) {
        sectionLogics.value = logicData
      } else {
        sectionLogics.value = []
      }

      // Determine initial active section
      const hasStartSection = loadedSections.some((s) => s.id === surveyData.start_section_id)
      const validStartId = hasStartSection
        ? surveyData.start_section_id
        : (loadedSections && loadedSections[0]?.id) || null

      currentSectionId.value = validStartId
      console.log('[SurveyRunner Debug] Active Section ID set to:', validStartId)

      navigationHistory.value = []
      completedCategories.value = []
      answers.value = {}
      accumulatedRecords.value = []
      validationErrors.value = {}
      isSubmitted.value = false
    } catch (err: any) {
      console.error('[SurveyRunner Debug] Error in loadSurveyAndSections:', err)
      errorMessage.value = err.message || 'Gagal memuat data survei'
    } finally {
      isLoading.value = false
    }
  }

  // Set individual answer and clear error for that question
  function setAnswer(questionId: string, value: any) {
    answers.value = {
      ...answers.value,
      [questionId]: value,
    }

    if (validationErrors.value[questionId]) {
      const updated = { ...validationErrors.value }
      delete updated[questionId]
      validationErrors.value = updated
    }
  }

  // Active section computing
  const currentSection = computed(() => {
    if (!currentSectionId.value) return null
    return sections.value.find((s) => String(s.id).trim().toLowerCase() === String(currentSectionId.value).trim().toLowerCase()) || null
  })

  // Questions for active section
  const currentQuestions = computed(() => {
    if (!currentSectionId.value) return []
    const targetSecId = String(currentSectionId.value).trim().toLowerCase()
    const filtered = allQuestions.value
      .filter((q) => String(q.section_id).trim().toLowerCase() === targetSecId)
      .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
    console.log('[SurveyRunner Debug] currentQuestions computed for section:', targetSecId, 'Result count:', filtered.length, filtered)
    return filtered
  })

  // Evaluate rule operator
  function evaluateRule(rule: SectionLogic, val: any): boolean {
    if (rule.operator === 'filled') {
      if (val === null || val === undefined || val === '') return false
      if (Array.isArray(val) && val.length === 0) return false
      return true
    }

    if (val === null || val === undefined || val === '') return false

    const condVal = rule.condition_value

    if (rule.operator === 'selected') {
      if (typeof val === 'object' && val !== null) {
        if (condVal && typeof condVal === 'object' && 'id' in (condVal as any)) {
          return val.id === (condVal as any).id
        }
        if (val.id && typeof condVal === 'string') {
          return val.id === condVal
        }
        if (val.text && typeof condVal === 'string') {
          return val.text === condVal
        }
      }
      if (typeof condVal === 'object' && condVal !== null && 'id' in (condVal as any)) {
        return String(val) === String((condVal as any).id)
      }
      return String(val) === String(condVal)
    }

    if (rule.operator === 'equals') {
      const valStr = typeof val === 'object' ? JSON.stringify(val) : String(val).trim().toLowerCase()
      const condStr = typeof condVal === 'object' ? JSON.stringify(condVal) : String(condVal).trim().toLowerCase()
      return valStr === condStr
    }

    if (rule.operator === 'not_equals') {
      const valStr = typeof val === 'object' ? JSON.stringify(val) : String(val).trim().toLowerCase()
      const condStr = typeof condVal === 'object' ? JSON.stringify(condVal) : String(condVal).trim().toLowerCase()
      return valStr !== condStr
    }

    if (rule.operator === 'greater_than') {
      const numVal = Number(val)
      const numCond = Number(condVal)
      if (isNaN(numVal) || isNaN(numCond)) return false
      return numVal > numCond
    }

    if (rule.operator === 'less_than') {
      const numVal = Number(val)
      const numCond = Number(condVal)
      if (isNaN(numVal) || isNaN(numCond)) return false
      return numVal < numCond
    }

    return false
  }

  // Calculate target section for a section based on rules and fallback
  function getNextSectionId(secId: string): string | null {
    const sec = sections.value.find((s) => String(s.id).trim().toLowerCase() === String(secId).trim().toLowerCase())
    if (!sec || sec.is_end_section) return null

    const rulesForSec = sectionLogics.value.filter((l) => String(l.source_section_id).trim().toLowerCase() === String(secId).trim().toLowerCase())

    for (const rule of rulesForSec) {
      const userAns = answers.value[rule.question_id]
      if (evaluateRule(rule, userAns)) {
        return rule.target_section_id
      }
    }

    if (sec.default_next_section_id) {
      return sec.default_next_section_id
    }

    // Natural linear fallback to next section by order_index
    const currentIndex = sections.value.findIndex((s) => String(s.id).trim().toLowerCase() === String(secId).trim().toLowerCase())
    if (currentIndex >= 0 && currentIndex < sections.value.length - 1) {
      return sections.value[currentIndex + 1].id
    }

    return null
  }

  // Frontend validation for active section questions
  function validateCurrentSection(): boolean {
    const errors: Record<string, string> = {}
    let isValid = true

    for (const q of currentQuestions.value) {
      if (q.is_required) {
        const val = answers.value[q.id]
        const isEmpty =
          val === undefined ||
          val === null ||
          val === '' ||
          (Array.isArray(val) && val.length === 0) ||
          (typeof val === 'object' && Object.keys(val).length === 0)

        if (isEmpty) {
          errors[q.id] = 'Pertanyaan ini wajib diisi'
          isValid = false
        }
      }
    }

    validationErrors.value = errors
    return isValid
  }

  // Helper to snapshot active section's answers into accumulatedRecords
  function snapshotCurrentSectionAnswers() {
    if (!currentSectionId.value) return

    const curSecId = currentSectionId.value
    const stepIdx = navigationHistory.value.length + 1
    const iterationIdx = navigationHistory.value.filter((id) => id === curSecId).length + 1

    // Remove any previously recorded answers for the exact same stepIndex
    accumulatedRecords.value = accumulatedRecords.value.filter((r) => r.stepIndex !== stepIdx)

    for (const q of currentQuestions.value) {
      const val = answers.value[q.id]
      if (val !== undefined && val !== null && val !== '') {
        accumulatedRecords.value.push({
          stepIndex: stepIdx,
          sectionId: curSecId,
          iterationIndex: iterationIdx,
          questionId: q.id,
          value: JSON.parse(JSON.stringify(val)),
        })
      }
    }
  }

  // Move to next section
  function goToNextSection(): boolean {
    if (!currentSectionId.value) return false

    if (!validateCurrentSection()) {
      return false
    }

    // 1. Snapshot current section answers
    snapshotCurrentSectionAnswers()

    // 2. Collect choices for state elimination (category tracking)
    for (const q of currentQuestions.value) {
      if (q.type === 'multiple_choice') {
        const val = answers.value[q.id]
        if (val) {
          const optId = typeof val === 'object' ? val.id : String(val)
          const optText = typeof val === 'object' ? val.text : String(val)
          const isGenericTrigger = ['ya', 'tidak', 'yes', 'no'].includes(String(optText).trim().toLowerCase())

          if (!isGenericTrigger) {
            const uniqueKey = `${q.id}_${optId}`
            if (!completedCategories.value.includes(uniqueKey)) {
              completedCategories.value.push(uniqueKey)
            }
            if (optText && !completedCategories.value.includes(optText)) {
              completedCategories.value.push(optText)
            }
          }
        }
      }
    }

    const nextId = getNextSectionId(currentSectionId.value)

    navigationHistory.value.push(currentSectionId.value)
    currentSectionId.value = nextId

    // 3. Prepare answers for next section (clear old loop values if starting fresh iteration)
    if (nextId) {
      const nextQuestions = allQuestions.value.filter((q) => q.section_id === nextId)
      for (const q of nextQuestions) {
        // Clear active selection if looping back so user gets fresh inputs for new iteration
        delete answers.value[q.id]
      }
    }

    return true
  }

  // Move to previous section
  function goToPreviousSection(): boolean {
    if (navigationHistory.value.length === 0) return false

    const prevId = navigationHistory.value.pop()
    if (prevId) {
      currentSectionId.value = prevId
      validationErrors.value = {}

      // Restore active section answers from accumulatedRecords for the previous step
      const stepIdx = navigationHistory.value.length + 1
      const stepRecords = accumulatedRecords.value.filter((r) => r.stepIndex === stepIdx)
      for (const rec of stepRecords) {
        answers.value[rec.questionId] = rec.value
      }

      return true
    }
    return false
  }

  // Atomic Submission helper
  async function submitSurvey(isPreview = false): Promise<boolean> {
    if (!survey.value) return false

    if (!validateCurrentSection()) {
      return false
    }

    // Snapshot final section answers before submitting
    snapshotCurrentSectionAnswers()

    isSubmitting.value = true
    errorMessage.value = null

    try {
      if (isPreview) {
        // Preview bypass database insertion
        await new Promise((res) => setTimeout(res, 400))
        isSubmitted.value = true
        return true
      }

      // 1. Insert into public.responses
      const { data: respData, error: respError } = await supabase
        .from('responses')
        .insert({
          survey_id: survey.value.id,
          submitted_at: new Date().toISOString(),
        })
        .select('id')
        .single()

      if (respError || !respData) {
        throw new Error(respError?.message || 'Gagal menyimpan respon survei')
      }

      const responseId = respData.id

      // 2. Prepare and insert accumulated multi-iteration answers into public.answers
      const answerRows = accumulatedRecords.value
        .filter((rec) => rec.value !== undefined && rec.value !== null && rec.value !== '')
        .map((rec) => ({
          response_id: responseId,
          question_id: rec.questionId,
          answer_value: rec.value,
          iteration_index: rec.iterationIndex,
        }))

      if (answerRows.length > 0) {
        const { error: ansError } = await supabase.from('answers').insert(answerRows)
        if (ansError) {
          throw new Error(ansError.message || 'Gagal menyimpan jawaban survei')
        }
      }

      isSubmitted.value = true
      return true
    } catch (err: any) {
      errorMessage.value = err.message || 'Gagal mengirimkan survei'
      return false
    } finally {
      isSubmitting.value = false
    }
  }

  return {
    survey,
    sections,
    allQuestions,
    sectionLogics,
    currentSectionId,
    currentSection,
    currentQuestions,
    answers,
    accumulatedRecords,
    navigationHistory,
    completedCategories,
    isLoading,
    isSubmitted,
    isSubmitting,
    errorMessage,
    validationErrors,
    loadSurveyAndSections,
    setAnswer,
    evaluateRule,
    getNextSectionId,
    validateCurrentSection,
    goToNextSection,
    goToPreviousSection,
    submitSurvey,
  }
}
