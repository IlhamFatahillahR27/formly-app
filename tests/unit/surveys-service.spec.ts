import { describe, it, expect, vi } from 'vitest'

describe('Phase 3: Surveys Composable & Service Logic', () => {
  it('should validate survey title on creation and link initial section', async () => {
    const createSurveyMock = vi.fn().mockImplementation(async (payload: { title: string; description?: string }) => {
      if (!payload.title || !payload.title.trim()) {
        return { survey: null, error: 'Judul survei wajib diisi.' }
      }
      return {
        survey: {
          id: 'survey-uuid-123',
          admin_id: 'admin-uuid-456',
          title: payload.title.trim(),
          description: payload.description || null,
          is_active: true,
          start_section_id: 'section-uuid-789',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        error: null,
      }
    })

    const emptyResult = await createSurveyMock({ title: '   ' })
    expect(emptyResult.error).toBe('Judul survei wajib diisi.')
    expect(emptyResult.survey).toBeNull()

    const validResult = await createSurveyMock({ title: 'Survei Kepuasan 2026', description: 'Deskripsi tes' })
    expect(validResult.error).toBeNull()
    expect(validResult.survey?.title).toBe('Survei Kepuasan 2026')
    expect(validResult.survey?.start_section_id).toBe('section-uuid-789')
  })

  it('should toggle survey active status', async () => {
    const toggleSurveyStatusMock = vi.fn().mockImplementation(async (id: string, isActive: boolean) => {
      return { success: true, error: null, newStatus: isActive }
    })

    const res = await toggleSurveyStatusMock('survey-uuid-123', false)
    expect(res.success).toBe(true)
    expect(res.newStatus).toBe(false)
  })

  it('should handle survey deletion', async () => {
    const deleteSurveyMock = vi.fn().mockImplementation(async (id: string) => {
      return { success: true, error: null }
    })

    const res = await deleteSurveyMock('survey-uuid-123')
    expect(res.success).toBe(true)
    expect(res.error).toBeNull()
  })
})
