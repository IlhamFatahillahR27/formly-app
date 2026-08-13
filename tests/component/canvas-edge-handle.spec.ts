import { describe, it, expect, vi } from 'vitest'
import { ref } from 'vue'

const stateMapSync: Record<string, ReturnType<typeof ref>> = {}

vi.stubGlobal('useSupabaseClient', () => ({
  from: (table: string) => ({
    select: () => ({
      eq: () => ({
        single: () => Promise.resolve({ data: { id: 'rule-1' }, error: null }),
        order: () => Promise.resolve({ data: [], error: null }),
      }),
    }),
    insert: (payload: unknown) => ({
      select: () => ({
        single: () => Promise.resolve({ data: { id: 'rule-1', ...(payload as Record<string, unknown>) }, error: null }),
      }),
    }),
    update: (payload: unknown) => ({
      eq: () => ({
        select: () => ({
          single: () => Promise.resolve({ data: { id: 'rule-1', ...(payload as Record<string, unknown>) }, error: null }),
        }),
      }),
    }),
    delete: () => ({
      eq: () => Promise.resolve({ error: null }),
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

describe('Canvas Flow Handle & UUID Parser Test', () => {
  it('correctly parses UUID containing hyphens using double underscore delimiter', () => {
    const questionUuid = 'd4aaa3fc-1234-4567-89ab-cdef01234567'
    const optionId = 'opt_1'
    const sourceHandle = `opt-source__${questionUuid}__${optionId}`

    expect(sourceHandle.startsWith('opt-source__')).toBe(true)

    const raw = sourceHandle.replace('opt-source__', '')
    const parts = raw.split('__')
    const extractedQuestionId = parts[0]
    const extractedOptionId = parts[1]

    expect(extractedQuestionId).toBe('d4aaa3fc-1234-4567-89ab-cdef01234567')
    expect(extractedOptionId).toBe('opt_1')
    expect(extractedQuestionId.length).toBe(36)
  })

  it('updates and deletes logic rules successfully via composable', async () => {
    const { survey, logicRules, createLogicRule, updateLogicRule, deleteLogicRule } = useSurveyBuilder()

    survey.value = {
      id: 'survey-1',
      admin_id: 'admin-1',
      title: 'Survey Test',
      description: null,
      is_active: true,
      start_section_id: 'sec-1',
      created_at: '',
      updated_at: '',
    }

    logicRules.value = []

    const rule = await createLogicRule({
      source_section_id: 'sec-1',
      question_id: 'd4aaa3fc-1234-4567-89ab-cdef01234567',
      operator: 'selected',
      condition_value: 'opt_1',
      target_section_id: 'sec-2',
    })

    expect(rule).not.toBeNull()
    expect(logicRules.value.length).toBe(1)
    expect(logicRules.value[0].question_id).toBe('d4aaa3fc-1234-4567-89ab-cdef01234567')

    // Test update
    const updated = await updateLogicRule('rule-1', {
      operator: 'equals',
      condition_value: 'opt_2',
    })

    expect(updated).toBe(true)
    expect(logicRules.value[0].operator).toBe('equals')
    expect(logicRules.value[0].condition_value).toBe('opt_2')

    // Test delete
    const deleted = await deleteLogicRule('rule-1')
    expect(deleted).toBe(true)
    expect(logicRules.value.length).toBe(0)
  })
})
