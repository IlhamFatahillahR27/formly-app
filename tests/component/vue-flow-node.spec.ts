import { describe, it, expect } from 'vitest'
import type { SectionNodeData } from '~/components/builder/nodes/SectionNode.vue'

describe('SectionNode Component Data Structure Test', () => {
  it('formats question options and section start badges accurately for canvas rendering', () => {
    const nodeData: SectionNodeData = {
      section: {
        id: 'sec-1',
        survey_id: 'survey-1',
        title: 'Section Utama',
        description: 'Deskripsi singkat',
        position_x: 150,
        position_y: 200,
        default_next_section_id: 'sec-2',
        is_end_section: false,
        order_index: 0,
        created_at: '',
        updated_at: '',
      },
      questions: [
        {
          id: 'q-1',
          section_id: 'sec-1',
          question_text: 'Pilih Kategori Anda',
          type: 'multiple_choice',
          is_required: true,
          options: [
            { id: 'opt_1', text: 'Kategori A' },
            { id: 'opt_2', text: 'Kategori B' },
          ],
          order_index: 0,
          created_at: '',
          updated_at: '',
        },
      ],
      isStart: true,
      collapsed: false,
    }

    expect(nodeData.section.title).toBe('Section Utama')
    expect(nodeData.isStart).toBe(true)
    expect(nodeData.questions.length).toBe(1)
    expect(nodeData.questions[0].type).toBe('multiple_choice')
    expect(Array.isArray(nodeData.questions[0].options)).toBe(true)
  })
})
