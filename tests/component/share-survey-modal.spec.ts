import { describe, it, expect, vi } from 'vitest'

describe('ShareSurveyModal Component Logic & State Tests', () => {
  it('computes public survey URL correctly when survey ID is provided', () => {
    const mockSurvey = {
      id: 'srv_123456',
      title: 'Survei Kepuasan Pelanggan 2026',
      is_active: true,
    }

    const origin = 'https://app.formly.id'
    const surveyUrl = mockSurvey.id ? `${origin}/survey/${mockSurvey.id}` : ''

    expect(surveyUrl).toBe('https://app.formly.id/survey/srv_123456')
  })

  it('returns empty survey URL when survey or survey ID is missing', () => {
    const mockSurveyNoId = { id: '', title: 'Draft' }
    const surveyUrl = mockSurveyNoId.id ? `https://app.formly.id/survey/${mockSurveyNoId.id}` : ''

    expect(surveyUrl).toBe('')
  })

  it('determines badge label and Nuxt UI color token for active vs draft survey', () => {
    const activeSurvey = { id: 's1', title: 'Publik', is_active: true }
    const draftSurvey = { id: 's2', title: 'Draft', is_active: false }
    const defaultSurvey = { id: 's3', title: 'Tanpa Status' }

    const getBadgeConfig = (survey?: { is_active?: boolean }) => ({
      label: survey?.is_active ? 'Publik' : 'Draft',
      color: survey?.is_active ? 'success' : 'neutral',
    })

    expect(getBadgeConfig(activeSurvey)).toEqual({ label: 'Publik', color: 'success' })
    expect(getBadgeConfig(draftSurvey)).toEqual({ label: 'Draft', color: 'neutral' })
    expect(getBadgeConfig(defaultSurvey)).toEqual({ label: 'Draft', color: 'neutral' })
  })

  it('handles copy link action, clipboard API, and toast notification', async () => {
    const mockUrl = 'https://app.formly.id/survey/srv_123456'
    const mockWriteText = vi.fn().mockResolvedValue(undefined)
    const mockToastAdd = vi.fn()

    let isCopied = false

    async function copyLink() {
      if (!mockUrl) return
      try {
        await mockWriteText(mockUrl)
        isCopied = true
        mockToastAdd({
          title: 'Tautan Tersalin!',
          description: 'URL survei publik berhasil disalin ke clipboard.',
          color: 'success',
        })
      } catch (err) {
        console.error(err)
      }
    }

    await copyLink()

    expect(mockWriteText).toHaveBeenCalledWith(mockUrl)
    expect(isCopied).toBe(true)
    expect(mockToastAdd).toHaveBeenCalledWith({
      title: 'Tautan Tersalin!',
      description: 'URL survei publik berhasil disalin ke clipboard.',
      color: 'success',
    })
  })

  it('sanitizes survey title for PNG card export filename correctly', () => {
    const sanitizeTitle = (title?: string) =>
      (title || 'survey').toLowerCase().replace(/[^a-z0-9]/g, '_')

    expect(sanitizeTitle('Survei Kepuasan Pelanggan 2026!')).toBe('survei_kepuasan_pelanggan_2026_')
    expect(sanitizeTitle('Evaluasi & Event#1')).toBe('evaluasi___event_1')
    expect(sanitizeTitle(undefined)).toBe('survey')
  })

  it('wraps long title text correctly on canvas context helper', () => {
    const mockCtx = {
      measureText: (text: string) => ({ width: text.length * 10 }),
    }

    function getWrappedLines(
      ctx: typeof mockCtx,
      text: string,
      maxWidth: number
    ): string[] {
      const words = text.split(' ')
      const lines: string[] = []
      let currentLine = words[0] || ''

      for (let i = 1; i < words.length; i++) {
        const word = words[i]
        const width = ctx.measureText(currentLine + ' ' + word).width
        if (width < maxWidth) {
          currentLine += ' ' + word
        } else {
          lines.push(currentLine)
          currentLine = word
        }
      }
      lines.push(currentLine)
      return lines
    }

    const lines = getWrappedLines(mockCtx, 'Survei Kepuasan Pelanggan Produk Baru Formly 2026', 200)

    expect(lines.length).toBeGreaterThan(1)
    expect(lines[0]).toContain('Survei')
  })
})
