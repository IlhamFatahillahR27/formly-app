import { describe, it, expect, vi } from 'vitest'
import Papa from 'papaparse'

// Stub global Nuxt composable before running tests
vi.stubGlobal('useSupabaseClient', () => ({
  from: () => ({
    select: () => ({
      eq: () => ({
        single: async () => ({ data: null, error: null }),
        order: async () => ({ data: [], error: null }),
      }),
      in: () => ({
        order: async () => ({ data: [], error: null }),
      }),
    }),
  }),
}))

import { useSurveyAnalytics, extractOptionText, formatFriendlyDate } from '~/composables/useSurveyAnalytics'
import type { SurveyRow, SectionRow, QuestionRow, ResponseRow, AnswerRow } from '~/composables/useSurveyAnalytics'

describe('useSurveyAnalytics - Unit Tests & Bugfixes', () => {
  const { parseQuestionOptions, processAnalyticsData, formatResponsesForCSV } = useSurveyAnalytics()

  it('extractOptionText correctly converts JSONB choice objects and arrays into clean human-readable strings', () => {
    // Stringified JSON object
    expect(extractOptionText('{"id":"opt_1","text":"Ya"}')).toBe('Ya')
    
    // JS object
    expect(extractOptionText({ id: 'opt_1', text: 'Opsi 1' })).toBe('Opsi 1')
    
    // Array of objects
    expect(extractOptionText([{ id: 'opt_1', text: 'Opsi 1' }, { id: 'opt_2', text: 'Opsi 2' }])).toBe('Opsi 1, Opsi 2')
    
    // Plain string
    expect(extractOptionText('Teks Bebas')).toBe('Teks Bebas')
    
    // Null or undefined
    expect(extractOptionText(null)).toBe('')
    expect(extractOptionText(undefined)).toBe('')
  })

  it('formatFriendlyDate correctly formats ISO timestamps into readable Indonesian date format', () => {
    const formatted = formatFriendlyDate('2026-08-12T11:46:58.859+00:00')
    expect(formatted).not.toContain('T')
    expect(formatted).not.toContain('+00:00')
    expect(formatted).toMatch(/12|Agu|2026/)
  })

  it('correctly parses question options for multiple choice and rating', () => {
    // Stringified array
    const mcOpts1 = JSON.stringify(['Pilihan A', 'Pilihan B'])
    const parsed1 = parseQuestionOptions(mcOpts1)
    expect(parsed1.choices).toEqual(['Pilihan A', 'Pilihan B'])
    expect(parsed1.maxRating).toBe(5)

    // Object with text properties
    const mcOpts2 = [{ id: '1', text: 'Sangat Baik' }, { id: '2', text: 'Cukup' }]
    const parsed2 = parseQuestionOptions(mcOpts2)
    expect(parsed2.choices).toEqual(['Sangat Baik', 'Cukup'])

    // Object with max_rating
    const ratingOpts = { max_rating: 10 }
    const parsed3 = parseQuestionOptions(ratingOpts)
    expect(parsed3.maxRating).toBe(10)
  })

  it('correctly aggregates choice stats, rating averages, section summaries, and text feeds without [object Object]', () => {
    const mockSurvey: SurveyRow = {
      id: 'survey-1',
      admin_id: 'admin-1',
      title: 'Survei Kepuasan',
      description: 'Tes',
      is_active: true,
      start_section_id: 'sec-1',
      created_at: '2026-08-12T00:00:00Z',
      updated_at: '2026-08-12T00:00:00Z',
    }

    const mockSections: SectionRow[] = [
      {
        id: 'sec-1',
        survey_id: 'survey-1',
        title: 'Section 1',
        description: null,
        position_x: 0,
        position_y: 0,
        default_next_section_id: null,
        is_end_section: false,
        order_index: 0,
        created_at: '2026-08-12T00:00:00Z',
        updated_at: '2026-08-12T00:00:00Z',
      },
    ]

    const mockQuestions: QuestionRow[] = [
      {
        id: 'q-mc',
        section_id: 'sec-1',
        question_text: 'Pilihan Favorit',
        type: 'multiple_choice',
        is_required: true,
        options: [{ id: 'opt_1', text: 'Opsi 1' }, { id: 'opt_2', text: 'Opsi 2' }],
        order_index: 0,
        created_at: '2026-08-12T00:00:00Z',
        updated_at: '2026-08-12T00:00:00Z',
      },
      {
        id: 'q-rate',
        section_id: 'sec-1',
        question_text: 'Rating Pelayanan',
        type: 'rating',
        is_required: true,
        options: { max_rating: 5 },
        order_index: 1,
        created_at: '2026-08-12T00:00:00Z',
        updated_at: '2026-08-12T00:00:00Z',
      },
    ]

    const mockResponses: ResponseRow[] = [
      { id: 'resp-1', survey_id: 'survey-1', submitted_at: '2026-08-12T10:00:00Z', created_at: '2026-08-12T10:00:00Z', updated_at: '2026-08-12T10:00:00Z' },
    ]

    const mockAnswers: AnswerRow[] = [
      // JSONB choice object answer
      { id: 'a1', response_id: 'resp-1', question_id: 'q-mc', answer_value: { id: 'opt_1', text: 'Opsi 1' }, iteration_index: 1, created_at: '2026-08-12T10:00:00Z', updated_at: '2026-08-12T10:00:00Z' },
      { id: 'a3', response_id: 'resp-1', question_id: 'q-rate', answer_value: 4, iteration_index: 1, created_at: '2026-08-12T10:00:00Z', updated_at: '2026-08-12T10:00:00Z' },
    ]

    const result = processAnalyticsData(mockSurvey, mockSections, mockQuestions, mockResponses, mockAnswers)

    expect(result.totalResponses).toBe(1)
    
    // Test MC analytics
    const mcQa = result.questionAnalytics.find(q => q.question.id === 'q-mc')
    expect(mcQa?.choiceStats).toBeDefined()
    const opsi1 = mcQa?.choiceStats?.find(c => c.label === 'Opsi 1')
    expect(opsi1?.count).toBe(1)
    expect(opsi1?.percentage).toBe(100)
    expect(mcQa?.choiceStats?.some(c => c.label.includes('[object Object]'))).toBe(false)

    // Test Section summaries calculation
    expect(result.sectionSummaries.length).toBe(1)
    const sec1Summary = result.sectionSummaries[0]
    expect(sec1Summary.ratingAverage).toBe(4)
    expect(sec1Summary.topChoice?.label).toBe('Opsi 1')
    expect(sec1Summary.totalAnswersCount).toBe(2)
  })

  it('formats survey response rows into user-friendly CSV headers grouped by Section with short Response ID adhering to csv-generator skill', () => {
    const mockSections: SectionRow[] = [
      {
        id: 'sec-1',
        survey_id: 'survey-1',
        title: 'Profil Responden',
        description: null,
        position_x: 0,
        position_y: 0,
        default_next_section_id: null,
        is_end_section: false,
        order_index: 0,
        created_at: '',
        updated_at: '',
      },
    ]

    const mockQuestions: QuestionRow[] = [
      {
        id: 'q1',
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

    const mockDetailedRows = [
      {
        responseId: 'resp-12345678',
        submittedAt: '2026-08-12T12:00:00Z',
        answersCount: 1,
        answersMap: { q1: ['Budi Utomo'] },
        rawAnswers: [],
      },
    ]

    const formatted = formatResponsesForCSV(mockQuestions, mockDetailedRows, mockSections)
    expect(formatted.length).toBe(1)
    expect(formatted[0]['ID Respon']).toBe('#resp-123')
    expect(formatted[0]['[Section 1: Profil Responden] P1: Nama Lengkap']).toBe('Budi Utomo')

    const csvString = Papa.unparse(formatted)
    expect(csvString).toContain('ID Respon')
    expect(csvString).toContain('#resp-123')
    expect(csvString).toContain('[Section 1: Profil Responden] P1: Nama Lengkap')
    expect(csvString).toContain('Budi Utomo')
  })
})
