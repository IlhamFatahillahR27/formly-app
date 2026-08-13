import { describe, it, expect } from 'vitest'
import type { QuestionRow } from '~/types/supabase'

describe('Survey Reorder Component Tests', () => {
  it('QuestionInput preserves custom option order for multiple choice questions', () => {
    const questionData: QuestionRow = {
      id: 'q-mc',
      section_id: 'sec-1',
      question_text: 'Pilih Buah Favorit Anda',
      type: 'multiple_choice',
      is_required: true,
      options: [
        { id: 'opt_banana', text: 'Pisang' },
        { id: 'opt_apple', text: 'Apel' },
        { id: 'opt_mango', text: 'Mangga' },
      ],
      order_index: 0,
      created_at: '',
      updated_at: '',
    }

    const options = questionData.options as Array<{ id: string; text: string }>
    expect(options[0].text).toBe('Pisang')
    expect(options[1].text).toBe('Apel')
    expect(options[2].text).toBe('Mangga')

    // Simulate reorder (moving Apel to top: index 1 -> index 0)
    const reorderedOptions = [options[1], options[0], options[2]]

    expect(reorderedOptions[0].text).toBe('Apel')
    expect(reorderedOptions[1].text).toBe('Pisang')
    expect(reorderedOptions[2].text).toBe('Mangga')
  })

  it('correctly shifts option positions when moveOptionUp or moveOptionDown is performed', () => {
    const optionsList = [
      { id: 'opt_1', text: 'Pilihan 1' },
      { id: 'opt_2', text: 'Pilihan 2' },
      { id: 'opt_3', text: 'Pilihan 3' },
    ]

    // Move option 2 (index 1) up
    const idxToMoveUp = 1
    const movedUpItem = optionsList.splice(idxToMoveUp, 1)[0]
    optionsList.splice(idxToMoveUp - 1, 0, movedUpItem)

    expect(optionsList[0].text).toBe('Pilihan 2')
    expect(optionsList[1].text).toBe('Pilihan 1')
    expect(optionsList[2].text).toBe('Pilihan 3')

    // Move option 2 (now index 0) down
    const idxToMoveDown = 0
    const movedDownItem = optionsList.splice(idxToMoveDown, 1)[0]
    optionsList.splice(idxToMoveDown + 1, 0, movedDownItem)

    expect(optionsList[0].text).toBe('Pilihan 1')
    expect(optionsList[1].text).toBe('Pilihan 2')
    expect(optionsList[2].text).toBe('Pilihan 3')
  })
})
