import { ref, computed } from 'vue'
import type { Database } from '~/types/supabase'

export type SurveyRow = Database['public']['Tables']['surveys']['Row']
export type SectionRow = Database['public']['Tables']['sections']['Row']
export type QuestionRow = Database['public']['Tables']['questions']['Row']
export type SectionLogicRow = Database['public']['Tables']['section_logic']['Row']

export function useSurveyRunner() {
  const supabase = useSupabaseClient<Database>()

  const survey = ref<SurveyRow | null>(null)
  const sections = ref<SectionRow[]>([])
  const allQuestions = ref<QuestionRow[]>([])
  const allLogicRules = ref<SectionLogicRow[]>([])

  const currentSectionId = ref<string | null>(null)
  const answers = ref<Record<string, any>>({})
  const navigationHistory = ref<string[]>([])
  const completedCategories = ref<string[]>([])

  const isLoading = ref(true)
  const isSubmitted = ref(false)
  const isSubmitting = ref(false)
  const errorMessage = ref<string | null>(null)
  const validationErrors = ref<Record<string, string>>({})

  const currentSection = computed(() => {
    if (!currentSectionId.value) return null
    return sections.value.find((s) => s.id === currentSectionId.value) || null
  })

  const currentQuestions = computed(() => {
    if (!currentSectionId.value) return []
    return allQuestions.value.filter((q) => q.section_id === currentSectionId.value)
  })

  /**
   * Fetch survey structure (Survey, Sections, Questions, Logic Rules)
   */
  async function loadSurveyAndSections(surveyId: string, isPreview = false) {
    if (!surveyId) {
      errorMessage.value = 'ID survei tidak valid.'
      isLoading.value = false
      return
    }

    isLoading.value = true
    errorMessage.value = null

    try {
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

      survey.value = surveyData

      if (!surveyData.is_active && !isPreview) {
        throw new Error('Survei ini sedang tidak aktif')
      }

      console.log('[SurveyRunner Debug] Survey loaded:', surveyData.title, 'is_active:', surveyData.is_active)

      // 2. Fetch sections ordered by order_index
      const { data: sectionData, error: sectionError } = await supabase
        .from('sections')
        .select('*')
        .eq('survey_id', surveyId)
        .order('order_index', { ascending: true })

      if (sectionError) {
        console.error('[SurveyRunner Debug] Section fetch error:', sectionError)
        throw new Error('Gagal memuat section survei')
      }

      sections.value = sectionData || []

      if (sections.value.length === 0) {
        throw new Error('Survei tidak memiliki section.')
      }

      // 3. Set starting section
      const startId = surveyData.start_section_id || sections.value[0]?.id
      currentSectionId.value = startId

      // 4. Fetch all questions for these sections
      const sectionIds = sections.value.map((s) => s.id)
      if (sectionIds.length > 0) {
        const { data: questionData, error: questionError } = await supabase
          .from('questions')
          .select('*')
          .in('section_id', sectionIds)
          .order('order_index', { ascending: true })

        if (questionError) {
          console.error('[SurveyRunner Debug] Question fetch error:', questionError)
          throw new Error('Gagal memuat pertanyaan survei')
        }

        allQuestions.value = questionData || []
      }

      // 5. Fetch section logic rules
      const { data: logicData, error: logicError } = await supabase
        .from('section_logic')
        .select('*')
        .eq('survey_id', surveyId)

      if (!logicError) {
        allLogicRules.value = logicData || []
      }
    } catch (err: unknown) {
      errorMessage.value = err instanceof Error ? err.message : 'Terjadi kesalahan saat memuat survei.'
    } finally {
      isLoading.value = false
    }
  }

  function setAnswer(questionId: string, value: any) {
    answers.value[questionId] = value
    if (validationErrors.value[questionId]) {
      delete validationErrors.value[questionId]
    }
  }

  function validateCurrentSection(): boolean {
    validationErrors.value = {}
    let isValid = true

    for (const q of currentQuestions.value) {
      if (q.is_required) {
        const val = answers.value[q.id]
        if (val === undefined || val === null || val === '') {
          validationErrors.value[q.id] = 'Pertanyaan ini wajib diisi'
          isValid = false
        } else if (typeof val === 'object' && !val.id && !val.text) {
          validationErrors.value[q.id] = 'Pertanyaan ini wajib diisi'
          isValid = false
        }
      }
    }

    return isValid
  }

  function evaluateRule(rule: SectionLogicRow, userAns: any): boolean {
    if (userAns === undefined || userAns === null) return false
    let answerText = ''
    if (typeof userAns === 'object' && userAns !== null) {
      answerText = userAns.id || userAns.text || ''
    } else {
      answerText = String(userAns)
    }
    const condVal = String(rule.condition_value || '')

    switch (rule.operator) {
      case 'selected':
      case 'equals':
        return answerText.toLowerCase() === condVal.toLowerCase()
      case 'not_equals':
        return answerText.toLowerCase() !== condVal.toLowerCase()
      case 'filled':
        return answerText.trim() !== ''
      case 'greater_than':
        return Number(answerText) > Number(condVal)
      case 'less_than':
        return Number(answerText) < Number(condVal)
      default:
        return false
    }
  }

  function evaluateLogicRules(sourceSectionId: string): string | null {
    const rules = allLogicRules.value.filter((r) => r.source_section_id === sourceSectionId)
    if (rules.length === 0) return null

    for (const rule of rules) {
      const userAns = answers.value[rule.question_id]
      if (evaluateRule(rule, userAns)) {
        return rule.target_section_id
      }
    }

    return null
  }

  function getNextSectionId(currentSecId: string): string | null {
    const logicTarget = evaluateLogicRules(currentSecId)
    if (logicTarget) {
      return logicTarget
    }

    const sec = sections.value.find((s) => s.id === currentSecId)
    if (sec && sec.default_next_section_id) {
      return sec.default_next_section_id
    }

    const currentIndex = sections.value.findIndex((s) => s.id === currentSecId)
    if (currentIndex !== -1 && currentIndex + 1 < sections.value.length) {
      return sections.value[currentIndex + 1].id
    }

    return null
  }

  function goToNextSection(): boolean {
    if (!validateCurrentSection()) {
      return false
    }

    if (!currentSectionId.value) return false

    // Track completed categories
    for (const q of currentQuestions.value) {
      if (q.type === 'multiple_choice' && answers.value[q.id]) {
        const val = answers.value[q.id]
        const optText = typeof val === 'object' ? val.text || val.id : String(val)
        const isGeneric = ['ya', 'tidak', 'yes', 'no'].includes(optText.trim().toLowerCase())
        if (!isGeneric) {
          const uniqueKey = `${q.id}_${typeof val === 'object' ? val.id : val}`
          if (!completedCategories.value.includes(uniqueKey)) {
            completedCategories.value.push(uniqueKey)
          }
          if (!completedCategories.value.includes(optText)) {
            completedCategories.value.push(optText)
          }
        }
      }
    }

    const nextId = getNextSectionId(currentSectionId.value)
    if (nextId) {
      navigationHistory.value.push(currentSectionId.value)
      currentSectionId.value = nextId
      return true
    }

    return false
  }

  function goToPreviousSection() {
    if (navigationHistory.value.length > 0) {
      const prevId = navigationHistory.value.pop()
      if (prevId) {
        currentSectionId.value = prevId
      }
    }
  }

  async function submitSurvey(isPreview = false): Promise<boolean> {
    if (!validateCurrentSection()) {
      return false
    }

    if (!survey.value) {
      errorMessage.value = 'Data survei tidak ditemukan.'
      return false
    }

    isSubmitting.value = true

    if (isPreview) {
      console.log('[SurveyRunner Preview Mode] Survey submit simulated with answers:', answers.value)
      isSubmitted.value = true
      isSubmitting.value = false
      return true
    }

    try {
      // 1. Insert new response record into DB
      const { data: respData, error: respErr } = await supabase
        .from('responses')
        .insert({
          survey_id: survey.value.id,
          submitted_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (respErr || !respData) {
        console.error('[SurveyRunner Debug] Response insert error:', respErr)
        throw new Error(respErr?.message || 'Gagal menyimpan data respon.')
      }

      // 2. Insert all answer records into DB
      const answerRowsToInsert = Object.entries(answers.value).map(([questionId, rawVal]) => {
        let answer_value: any = rawVal
        if (typeof rawVal === 'string' || typeof rawVal === 'number' || typeof rawVal === 'boolean') {
          answer_value = rawVal
        } else if (rawVal !== null && rawVal !== undefined) {
          answer_value = JSON.stringify(rawVal)
        }

        return {
          response_id: respData.id,
          question_id: questionId,
          answer_value,
          iteration_index: 1,
        }
      })

      if (answerRowsToInsert.length > 0) {
        const { error: ansErr } = await supabase
          .from('answers')
          .insert(answerRowsToInsert)

        if (ansErr) {
          console.error('[SurveyRunner Debug] Answers insert error:', ansErr)
          throw new Error(ansErr.message || 'Gagal menyimpan rincian jawaban.')
        }
      }

      isSubmitted.value = true
      return true
    } catch (err: unknown) {
      errorMessage.value = err instanceof Error ? err.message : 'Gagal mengirimkan respon survei.'
      return false
    } finally {
      isSubmitting.value = false
    }
  }

  return {
    survey,
    sections,
    allQuestions,
    allLogicRules,
    sectionLogics: allLogicRules,
    currentSectionId,
    currentSection,
    currentQuestions,
    answers,
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
    validateCurrentSection,
    getNextSectionId,
    goToNextSection,
    goToPreviousSection,
    submitSurvey,
  }
}
