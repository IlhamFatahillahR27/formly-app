import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'

const stateMap: Record<string, ReturnType<typeof ref>> = {}

const mockInsertFn = vi.fn()

vi.stubGlobal('useSupabaseClient', () => ({
  from: (table: string) => ({
    select: () => ({
      eq: (col: string, val: any) => ({
        single: () => {
          if (table === 'surveys') {
            return Promise.resolve({
              data: {
                id: val,
                admin_id: 'admin-1',
                title: 'Survei Kepuasan',
                description: 'Deskripsi survei',
                is_active: true,
                start_section_id: 'sec-1',
                created_at: '',
                updated_at: '',
              },
              error: null,
            })
          }
          return Promise.resolve({ data: null, error: null })
        },
        order: () => Promise.resolve({ data: [], error: null }),
      }),
      in: () => ({
        order: () => Promise.resolve({ data: [], error: null }),
      }),
    }),
    insert: (payload: any) => {
      mockInsertFn(table, payload)
      return {
        select: () => ({
          single: () => Promise.resolve({ data: { id: 'resp-123' }, error: null }),
        }),
        error: null,
      }
    },
  }),
}))

vi.stubGlobal('useState', (key: string, init: () => unknown) => {
  if (!stateMap[key]) {
    stateMap[key] = ref(init())
  }
  return stateMap[key]
})

import { useSurveyRunner } from '~/composables/useSurveyRunner'

describe('Survey Runner & Dynamic Logic Engine Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    stateMap['runner_answers'] = ref({})
    stateMap['runner_validation_errors'] = ref({})
    stateMap['runner_nav_history'] = ref([])
    stateMap['runner_completed_categories'] = ref([])
    stateMap['runner_all_questions'] = ref([])
  })

  it('evaluates rule operators correctly (selected, filled, equals, greater_than, less_than)', () => {
    const { evaluateRule } = useSurveyRunner()

    // 1. filled
    expect(evaluateRule({ operator: 'filled' } as any, 'jawaban')).toBe(true)
    expect(evaluateRule({ operator: 'filled' } as any, '')).toBe(false)
    expect(evaluateRule({ operator: 'filled' } as any, null)).toBe(false)

    // 2. selected
    expect(evaluateRule({ operator: 'selected', condition_value: 'opt_a' } as any, 'opt_a')).toBe(true)
    expect(evaluateRule({ operator: 'selected', condition_value: 'opt_a' } as any, { id: 'opt_a', text: 'Opsi A' })).toBe(true)
    expect(evaluateRule({ operator: 'selected', condition_value: 'opt_a' } as any, 'opt_b')).toBe(false)

    // 3. equals
    expect(evaluateRule({ operator: 'equals', condition_value: 'ya' } as any, 'Ya')).toBe(true)
    expect(evaluateRule({ operator: 'equals', condition_value: 'ya' } as any, 'Tidak')).toBe(false)

    // 4. not_equals
    expect(evaluateRule({ operator: 'not_equals', condition_value: 'ya' } as any, 'Tidak')).toBe(true)

    // 5. greater_than & less_than
    expect(evaluateRule({ operator: 'greater_than', condition_value: 3 } as any, 4)).toBe(true)
    expect(evaluateRule({ operator: 'greater_than', condition_value: 3 } as any, 2)).toBe(false)
    expect(evaluateRule({ operator: 'less_than', condition_value: 5 } as any, 2)).toBe(true)
  })

  it('determines next section ID using branching logic rules and fallback', () => {
    const { sections, sectionLogics, answers, getNextSectionId } = useSurveyRunner()

    sections.value = [
      {
        id: 'sec-1',
        survey_id: 'survey-1',
        title: 'Section 1',
        description: null,
        position_x: 0,
        position_y: 0,
        default_next_section_id: 'sec-fallback',
        is_end_section: false,
        order_index: 0,
        created_at: '',
        updated_at: '',
      },
    ]

    sectionLogics.value = [
      {
        id: 'logic-1',
        survey_id: 'survey-1',
        source_section_id: 'sec-1',
        question_id: 'q-1',
        operator: 'selected',
        condition_value: 'opt_b',
        target_section_id: 'sec-branch-b',
        created_at: '',
        updated_at: '',
      },
    ]

    // Fallback case when condition is not met
    answers.value = { 'q-1': 'opt_a' }
    expect(getNextSectionId('sec-1')).toBe('sec-fallback')

    // Branching case when condition matches
    answers.value = { 'q-1': 'opt_b' }
    expect(getNextSectionId('sec-1')).toBe('sec-branch-b')
  })

  it('validates required questions before navigation', () => {
    const { allQuestions, currentSectionId, answers, validateCurrentSection } = useSurveyRunner()

    currentSectionId.value = 'sec-1'
    allQuestions.value = [
      {
        id: 'q-req',
        section_id: 'sec-1',
        question_text: 'Nama Lengkap',
        type: 'short_text',
        is_required: true,
        options: null,
        order_index: 0,
        created_at: '',
        updated_at: '',
      },
    ]

    answers.value = {}
    expect(validateCurrentSection()).toBe(false)

    answers.value = { 'q-req': 'Ilham' }
    expect(validateCurrentSection()).toBe(true)
  })

  it('bypasses database insertion during preview mode submit', async () => {
    const { survey, currentSectionId, allQuestions, answers, submitSurvey, isSubmitted } = useSurveyRunner()

    survey.value = {
      id: 'survey-1',
      admin_id: 'admin-1',
      title: 'Preview Survey',
      description: null,
      is_active: true,
      start_section_id: 'sec-1',
      created_at: '',
      updated_at: '',
    }
    currentSectionId.value = 'sec-1'
    allQuestions.value = []
    answers.value = {}

    const success = await submitSurvey(true) // isPreview = true
    expect(success).toBe(true)
    expect(isSubmitted.value).toBe(true)
    expect(mockInsertFn).not.toHaveBeenCalled()
  })

  it('performs atomic insertion to public.responses and public.answers in normal guest submit', async () => {
    const { survey, currentSectionId, allQuestions, answers, submitSurvey, isSubmitted } = useSurveyRunner()

    survey.value = {
      id: 'survey-1',
      admin_id: 'admin-1',
      title: 'Live Survey',
      description: null,
      is_active: true,
      start_section_id: 'sec-1',
      created_at: '',
      updated_at: '',
    }
    currentSectionId.value = 'sec-1'
    allQuestions.value = [
      {
        id: 'q-1',
        section_id: 'sec-1',
        question_text: 'Umpan balik',
        type: 'short_text',
        is_required: false,
        options: null,
        order_index: 0,
        created_at: '',
        updated_at: '',
      },
    ]
    answers.value = { 'q-1': 'Sangat Bagus' }

    const success = await submitSurvey(false) // isPreview = false
    expect(success).toBe(true)
    expect(isSubmitted.value).toBe(true)
    expect(mockInsertFn).toHaveBeenCalledWith('responses', expect.objectContaining({ survey_id: 'survey-1' }))
    expect(mockInsertFn).toHaveBeenCalledWith(
      'answers',
      expect.arrayContaining([
        expect.objectContaining({
          response_id: 'resp-123',
          question_id: 'q-1',
          answer_value: 'Sangat Bagus',
        }),
      ])
    )
  })
})
