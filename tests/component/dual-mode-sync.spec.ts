import { describe, it, expect, vi } from 'vitest'
import { ref } from 'vue'

const stateMapSync: Record<string, ReturnType<typeof ref>> = {}

vi.stubGlobal('useSupabaseClient', () => ({
  from: () => ({
    select: () => ({
      eq: () => ({
        single: () => Promise.resolve({ data: { id: 'survey-1', title: 'Test' }, error: null }),
        order: () => Promise.resolve({ data: [], error: null }),
      }),
    }),
    insert: (payload: unknown) => ({
      select: () => ({
        single: () => Promise.resolve({ data: { id: 'sec-2', title: 'Section 2', ...(payload as Record<string, unknown>) }, error: null }),
      }),
    }),
  }),
}))

vi.stubGlobal('useState', (key: string, init: () => unknown) => {
  if (!stateMapSync[key]) {
    stateMapSync[key] = ref(init())
  }
  return stateMapSync[key]
})

import { useSurveyBuilder } from '~/composables/useSurveyBuilder'

describe('Dual-Mode State Synchronization Component Test', () => {
  it('synchronizes section additions instantly across linear and canvas data stores', async () => {
    const { survey, sections, createSection } = useSurveyBuilder()

    survey.value = {
      id: 'survey-1',
      admin_id: 'admin-1',
      title: 'Survey Test Sync',
      description: null,
      is_active: true,
      start_section_id: 'sec-1',
      created_at: '',
      updated_at: '',
    }

    sections.value = [
      {
        id: 'sec-1',
        survey_id: 'survey-1',
        title: 'Section 1',
        description: null,
        position_x: 100,
        position_y: 100,
        default_next_section_id: null,
        is_end_section: false,
        order_index: 0,
        created_at: '',
        updated_at: '',
      },
    ]

    expect(sections.value.length).toBe(1)

    // Add new section
    await createSection({ title: 'Section 2' })

    // Verify sections count updated
    expect(sections.value.length).toBe(2)
    expect(sections.value[1].title).toBe('Section 2')
  })
})
