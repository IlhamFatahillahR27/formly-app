import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'
import type { SectionRow, QuestionRow } from '~/composables/useSurveyBuilder'

const stateMap: Record<string, ReturnType<typeof ref>> = {}

// Stub Nuxt auto-imports globally for Vitest
vi.stubGlobal('useSupabaseClient', () => ({
  from: () => ({
    select: () => ({
      eq: () => ({
        single: () => Promise.resolve({ data: { id: 'survey-1', title: 'Test Survey' }, error: null }),
        order: () => Promise.resolve({ data: [], error: null }),
      }),
      in: () => ({
        order: () => Promise.resolve({ data: [], error: null }),
      }),
    }),
    insert: (payload: unknown) => ({
      select: () => ({
        single: () => Promise.resolve({ data: { id: 'new-id', ...(payload as Record<string, unknown>) }, error: null }),
      }),
    }),
    update: () => ({
      eq: () => Promise.resolve({ error: null }),
    }),
    delete: () => ({
      eq: () => Promise.resolve({ error: null }),
    }),
  }),
}))

vi.stubGlobal('useState', (key: string, init: () => unknown) => {
  if (!stateMap[key]) {
    stateMap[key] = ref(init())
  }
  return stateMap[key]
})

import { useSurveyBuilder } from '~/composables/useSurveyBuilder'

describe('Survey Builder Reorder Logic Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset state map for isolation
    for (const key in stateMap) {
      delete stateMap[key]
    }
  })

  it('moves section up and down correctly updating order_index', async () => {
    const { sections, moveSection } = useSurveyBuilder()

    const sec1: SectionRow = {
      id: 'sec-1',
      survey_id: 'survey-1',
      title: 'Section Pertama',
      description: null,
      position_x: 0,
      position_y: 0,
      default_next_section_id: null,
      is_end_section: false,
      order_index: 0,
      created_at: '',
      updated_at: '',
    }
    const sec2: SectionRow = {
      id: 'sec-2',
      survey_id: 'survey-1',
      title: 'Section Kedua',
      description: null,
      position_x: 280,
      position_y: 0,
      default_next_section_id: null,
      is_end_section: false,
      order_index: 1,
      created_at: '',
      updated_at: '',
    }
    const sec3: SectionRow = {
      id: 'sec-3',
      survey_id: 'survey-1',
      title: 'Section Ketiga',
      description: null,
      position_x: 560,
      position_y: 0,
      default_next_section_id: null,
      is_end_section: false,
      order_index: 2,
      created_at: '',
      updated_at: '',
    }

    sections.value = [sec1, sec2, sec3]

    // Moving top section up should do nothing
    const moveTopUpResult = await moveSection('sec-1', 'up')
    expect(moveTopUpResult).toBe(false)
    expect(sections.value[0].id).toBe('sec-1')

    // Move Section 2 up (swap sec-2 and sec-1)
    const moveSec2UpResult = await moveSection('sec-2', 'up')
    expect(moveSec2UpResult).toBe(true)
    expect(sections.value[0].id).toBe('sec-2')
    expect(sections.value[1].id).toBe('sec-1')

    // Move Section 2 down (swap sec-2 and sec-1 back)
    const moveSec2DownResult = await moveSection('sec-2', 'down')
    expect(moveSec2DownResult).toBe(true)
    expect(sections.value[0].id).toBe('sec-1')
    expect(sections.value[1].id).toBe('sec-2')
  })

  it('moves question up and down within its section updating order_index', async () => {
    const { questions, moveQuestion } = useSurveyBuilder()

    const q1: QuestionRow = {
      id: 'q-1',
      section_id: 'sec-1',
      question_text: 'Pertanyaan A',
      type: 'short_text',
      is_required: true,
      options: null,
      order_index: 0,
      created_at: '',
      updated_at: '',
    }
    const q2: QuestionRow = {
      id: 'q-2',
      section_id: 'sec-1',
      question_text: 'Pertanyaan B',
      type: 'multiple_choice',
      is_required: true,
      options: [
        { id: 'opt_1', text: 'Opsi 1' },
        { id: 'opt_2', text: 'Opsi 2' },
      ],
      order_index: 1,
      created_at: '',
      updated_at: '',
    }
    const q3: QuestionRow = {
      id: 'q-3',
      section_id: 'sec-1',
      question_text: 'Pertanyaan C',
      type: 'rating',
      is_required: false,
      options: { max_rating: 5 },
      order_index: 2,
      created_at: '',
      updated_at: '',
    }

    questions.value = [q1, q2, q3]

    // Move Question B (q-2) up -> should swap q-2 and q-1
    const moveResult = await moveQuestion('q-2', 'up')
    expect(moveResult).toBe(true)

    const sec1Questions = questions.value.filter((q) => q.section_id === 'sec-1')
    expect(sec1Questions[0].id).toBe('q-2')
    expect(sec1Questions[1].id).toBe('q-1')

    // Move Question B (q-2) down -> should swap q-2 and q-1 back
    const moveDownResult = await moveQuestion('q-2', 'down')
    expect(moveDownResult).toBe(true)

    const sec1QuestionsAfter = questions.value.filter((q) => q.section_id === 'sec-1')
    expect(sec1QuestionsAfter[0].id).toBe('q-1')
    expect(sec1QuestionsAfter[1].id).toBe('q-2')
  })
})
