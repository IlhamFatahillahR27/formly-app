import type { Database } from '~/types/supabase'

export type SurveyRow = Database['public']['Tables']['surveys']['Row']
export type SurveyWithStats = SurveyRow & {
  sections?: { count: number }[]
  responses?: { count: number }[]
  section_count?: number
  response_count?: number
}

export function useSurveys() {
  const supabase = useSupabaseClient<Database>()
  const user = useSupabaseUser()

  /**
   * Helper to retrieve active user ID from composable state or active Supabase session
   */
  async function getActiveUserId(): Promise<string | null> {
    if (user.value?.id) {
      return user.value.id
    }

    try {
      const { data: { session } } = await supabase.auth.getSession()
      return session?.user?.id || null
    } catch {
      return null
    }
  }

  /**
   * Fetch list of surveys created by the logged-in admin
   */
  async function fetchSurveys(): Promise<{ surveys: SurveyWithStats[]; error: string | null }> {
    const userId = await getActiveUserId()

    if (!userId) {
      return { surveys: [], error: 'User tidak terautentikasi.' }
    }

    try {
      // Disambiguate sections and responses relationships
      const { data, error } = await supabase
        .from('surveys')
        .select(`
          *,
          sections!sections_survey_id_fkey (count),
          responses (count)
        `)
        .eq('admin_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        return { surveys: [], error: error.message }
      }

      const formattedSurveys: SurveyWithStats[] = (data || []).map((item: unknown) => {
        const raw = item as Record<string, unknown>
        const sections = raw.sections as { count: number }[] | undefined
        const responses = raw.responses as { count: number }[] | undefined

        return {
          ...(raw as SurveyRow),
          section_count: sections?.[0]?.count ?? 0,
          response_count: responses?.[0]?.count ?? 0,
        }
      })

      return { surveys: formattedSurveys, error: null }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Terjadi kesalahan saat mengambil daftar survei.'
      return { surveys: [], error: errorMessage }
    }
  }

  /**
   * Create a new survey and initialize its start section ("Section 1")
   */
  async function createSurvey(payload: {
    title: string
    description?: string
  }): Promise<{ survey: SurveyRow | null; error: string | null }> {
    const userId = await getActiveUserId()

    if (!userId) {
      return { survey: null, error: 'User tidak terautentikasi.' }
    }

    if (!payload.title || !payload.title.trim()) {
      return { survey: null, error: 'Judul survei wajib diisi.' }
    }

    try {
      // 1. Insert new survey
      const { data: newSurvey, error: surveyError } = await supabase
        .from('surveys')
        .insert({
          admin_id: userId,
          title: payload.title.trim(),
          description: payload.description?.trim() || null,
          is_active: true,
        })
        .select()
        .single()

      if (surveyError || !newSurvey) {
        return { survey: null, error: surveyError?.message || 'Gagal membuat survei.' }
      }

      // 2. Create initial start section ("Section 1")
      const { data: newSection, error: sectionError } = await supabase
        .from('sections')
        .insert({
          survey_id: newSurvey.id,
          title: 'Section 1',
          description: 'Bagian utama survei',
          position_x: 100,
          position_y: 100,
          order_index: 0,
        })
        .select()
        .single()

      if (sectionError || !newSection) {
        return { survey: newSurvey, error: null }
      }

      // 3. Update survey start_section_id
      const { data: updatedSurvey, error: updateError } = await supabase
        .from('surveys')
        .update({ start_section_id: newSection.id })
        .eq('id', newSurvey.id)
        .select()
        .single()

      if (updateError) {
        return { survey: newSurvey, error: null }
      }

      return { survey: updatedSurvey, error: null }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Terjadi kesalahan sistem saat membuat survei.'
      return { survey: null, error: errorMessage }
    }
  }

  /**
   * Toggle survey active status
   */
  async function toggleSurveyStatus(
    surveyId: string,
    isActive: boolean
  ): Promise<{ success: boolean; error: string | null }> {
    if (!surveyId) {
      return { success: false, error: 'ID survei tidak valid.' }
    }

    try {
      const { error } = await supabase
        .from('surveys')
        .update({ is_active: isActive })
        .eq('id', surveyId)

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true, error: null }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Terjadi kesalahan saat memperbarui status survei.'
      return { success: false, error: errorMessage }
    }
  }

  /**
   * Delete a survey by ID
   */
  async function deleteSurvey(surveyId: string): Promise<{ success: boolean; error: string | null }> {
    if (!surveyId) {
      return { success: false, error: 'ID survei tidak valid.' }
    }

    try {
      const { error } = await supabase
        .from('surveys')
        .delete()
        .eq('id', surveyId)

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true, error: null }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Terjadi kesalahan saat menghapus survei.'
      return { success: false, error: errorMessage }
    }
  }

  return {
    fetchSurveys,
    createSurvey,
    toggleSurveyStatus,
    deleteSurvey,
  }
}
