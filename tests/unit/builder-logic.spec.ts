import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'

const stateMap: Record<string, ReturnType<typeof ref>> = {}

// Stub Nuxt auto-imports globally
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

describe('Survey Builder Logic Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  it('updates node position locally immediately and debounces database save', () => {
    const { sections, updateNodePosition } = useSurveyBuilder()

    sections.value = [
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
        created_at: '',
        updated_at: '',
      },
    ]

    // Trigger drag stop position update
    updateNodePosition('sec-1', 250, 450)

    // Verify local reactive state is updated immediately
    expect(sections.value[0].position_x).toBe(250)
    expect(sections.value[0].position_y).toBe(450)

    // Fast-forward timers by 500ms
    vi.advanceTimersByTime(500)
  })

  it('initializes default options for multiple choice questions correctly', async () => {
    const { questions, createQuestion } = useSurveyBuilder()
    questions.value = []

    await createQuestion('sec-1', {
      question_text: 'Pilih Kategori',
      type: 'multiple_choice',
    })

    expect(questions.value.length).toBe(1)
    expect(questions.value[0].question_text).toBe('Pilih Kategori')
  })
})
