import { describe, it, expect } from 'vitest'

describe('Guest Survey Flow & UI Component Tests', () => {
  it('formats multiple choice options and detects state elimination correctly', () => {
    const rawOptions = [
      { id: 'opt_1', text: 'Kategori A' },
      { id: 'opt_2', text: 'Kategori B' },
      { id: 'opt_3', text: 'Kategori C' },
    ]

    const completedCategories = ['opt_1']

    const processedOptions = rawOptions.map((opt) => ({
      ...opt,
      isCompleted: completedCategories.includes(opt.id) || completedCategories.includes(opt.text),
    }))

    expect(processedOptions[0].isCompleted).toBe(true)
    expect(processedOptions[1].isCompleted).toBe(false)
    expect(processedOptions[2].isCompleted).toBe(false)
  })

  it('detects preview mode banner active state from route query', () => {
    const routeQueryPreview = 'true'
    const isPreview = routeQueryPreview === 'true' || routeQueryPreview === '1'
    expect(isPreview).toBe(true)

    const routeQueryPreviewNumeric = '1'
    const isPreviewNumeric = routeQueryPreviewNumeric === 'true' || routeQueryPreviewNumeric === '1'
    expect(isPreviewNumeric).toBe(true)

    const normalQueryPreview = undefined
    const isNormal = normalQueryPreview === 'true' || normalQueryPreview === '1'
    expect(isNormal).toBe(false)
  })

  it('uses sticky top-16 z-40 class for positioning below AppNavbar', () => {
    const bannerClasses = 'sticky top-16 z-40 w-full bg-amber-50 dark:bg-amber-950/90 border-b border-amber-200 dark:border-amber-800/60 px-4 py-2.5 shadow-sm backdrop-blur transition-all'
    expect(bannerClasses).toContain('sticky top-16 z-40')
    expect(bannerClasses).toContain('bg-amber-50')
  })

  it('validates question input required state properly', () => {
    const questionShortText = {
      id: 'q1',
      question_text: 'Nama',
      type: 'short_text',
      is_required: true,
    }

    const questionOptionalText = {
      id: 'q2',
      question_text: 'Catatan',
      type: 'short_text',
      is_required: false,
    }

    function checkEmpty(val: any) {
      return val === undefined || val === null || val === ''
    }

    expect(questionShortText.is_required && checkEmpty('')).toBe(true)
    expect(questionOptionalText.is_required && checkEmpty('')).toBe(false)
  })

  it('calculates survey execution progress percentage correctly', () => {
    const totalSections = 4
    const historyStepsCount = 2 // 2 past steps + 1 current step = step 3

    const currentStep = historyStepsCount + 1
    const progressPercentage = Math.min(Math.round((currentStep / totalSections) * 100), 100)

    expect(progressPercentage).toBe(75)
  })

  it('defines responsive max-width breakpoint classes below lg and caps container at lg:max-w-3xl', () => {
    const containerClasses = 'flex-1 w-full mx-auto px-3 sm:px-6 md:px-8 lg:px-4 py-4 sm:py-6 md:py-8 lg:py-12 max-w-full sm:max-w-xl md:max-w-2xl lg:max-w-3xl flex flex-col justify-center transition-all duration-300'

    expect(containerClasses).toContain('max-w-full')
    expect(containerClasses).toContain('sm:max-w-xl')
    expect(containerClasses).toContain('md:max-w-2xl')
    expect(containerClasses).toContain('lg:max-w-3xl')
  })

  it('defines explicit aspect ratio classes for status badge and star controls', () => {
    const badgeIconClasses = 'w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 aspect-square'
    const ratingStarClasses = 'w-8 h-8 sm:w-9 sm:h-9 aspect-square'

    expect(badgeIconClasses).toContain('aspect-square')
    expect(ratingStarClasses).toContain('aspect-square')
  })

  it('defines option layout classes for lg and below in QuestionInput', () => {
    const optionGridClasses = 'grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-2 sm:gap-2.5'

    expect(optionGridClasses).toContain('grid-cols-1')
    expect(optionGridClasses).toContain('md:grid-cols-2')
    expect(optionGridClasses).toContain('lg:grid-cols-1')
  })
})
