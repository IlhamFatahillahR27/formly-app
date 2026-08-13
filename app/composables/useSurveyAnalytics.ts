import type { Database, SurveyRow, SectionRow, QuestionRow, ResponseRow, AnswerRow } from '~/types/supabase'

export type { SurveyRow, SectionRow, QuestionRow, ResponseRow, AnswerRow }


export interface ChoiceStat {
  label: string
  count: number
  percentage: number
}

export interface QuestionAnalytics {
  question: QuestionRow
  totalAnswers: number
  // For multiple_choice
  choiceStats?: ChoiceStat[]
  // For rating
  averageRating?: number
  maxRating?: number
  ratingDistribution?: Record<number, number>
  // For short_text & long_text
  textResponses?: Array<{
    responseId: string
    iterationIndex: number
    value: string
    submittedAt: string
  }>
}

export interface DetailedResponseRow {
  responseId: string
  submittedAt: string
  answersCount: number
  answersMap: Record<string, string[]> // questionId -> list of clean answer strings
  rawAnswers: AnswerRow[]
}

export interface SectionAnalyticsSummary {
  section: SectionRow
  sectionIndex: number
  questionAnalyticsList: QuestionAnalytics[]
  // Rating summary
  ratingCount: number
  ratingAverage: number | null
  ratingMaxScale: number
  ratingQuestionCount: number
  // Most popular choice summary
  topChoice?: {
    label: string
    count: number
    percentage: number
    questionText: string
  }
  // Text response summary
  textResponseCount: number
  totalAnswersCount: number
  questionCount: number
}

export interface AnalyticsSummary {
  survey: SurveyRow
  sections: SectionRow[]
  questions: QuestionRow[]
  totalResponses: number
  totalQuestions: number
  averageRatingOverall: number | null
  latestSubmission: string | null
  questionAnalytics: QuestionAnalytics[]
  sectionSummaries: SectionAnalyticsSummary[]
}

/**
 * Safely extracts human-readable text from raw choice value (handles stringified JSON, JS objects, arrays, etc.)
 */
export function extractOptionText(val: unknown): string {
  if (val === null || val === undefined) {
    return ''
  }

  // Handle stringified JSON
  if (typeof val === 'string') {
    const trimmed = val.trim()
    if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
      try {
        const parsed = JSON.parse(trimmed)
        return extractOptionText(parsed)
      } catch {
        return val
      }
    }
    return val
  }

  // Handle array of values/objects
  if (Array.isArray(val)) {
    return val.map(item => extractOptionText(item)).filter(Boolean).join(', ')
  }

  // Handle object e.g. { id: 'opt_1', text: 'Ya' } or { id: 'opt_1', value: 'Ya' }
  if (typeof val === 'object') {
    const obj = val as Record<string, unknown>
    if (typeof obj.text === 'string' && obj.text.trim()) {
      return obj.text.trim()
    }
    if (typeof obj.value === 'string' && obj.value.trim()) {
      return obj.value.trim()
    }
    if (typeof obj.label === 'string' && obj.label.trim()) {
      return obj.label.trim()
    }
    const firstStr = Object.values(obj).find(v => typeof v === 'string' && (v as string).trim())
    if (typeof firstStr === 'string') {
      return firstStr.trim()
    }
  }

  return String(val)
}

/**
 * Format timestamp into clean local Indonesian date string e.g. "12 Agu 2026, 18.46"
 */
export function formatFriendlyDate(dateStr: string): string {
  if (!dateStr) return '-'
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return dateStr
    return d.toLocaleString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return dateStr
  }
}

export function useSurveyAnalytics() {
  const supabase = useSupabaseClient<Database>()

  /**
   * Helper to parse question options safely
   */
  function parseQuestionOptions(optionsJson: unknown): {
    choices: string[]
    maxRating: number
  } {
    let choices: string[] = []
    let maxRating = 5

    if (!optionsJson) {
      return { choices, maxRating }
    }

    try {
      const opts = typeof optionsJson === 'string' ? JSON.parse(optionsJson) : optionsJson

      if (Array.isArray(opts)) {
        choices = opts.map(opt => extractOptionText(opt)).filter(Boolean)
      } else if (typeof opts === 'object' && opts !== null) {
        const rawObj = opts as Record<string, unknown>
        if (Array.isArray(rawObj.choices)) {
          choices = rawObj.choices.map(c => extractOptionText(c)).filter(Boolean)
        } else if (Array.isArray(rawObj.options)) {
          choices = rawObj.options.map(o => extractOptionText(o)).filter(Boolean)
        }

        if (typeof rawObj.max_rating === 'number') {
          maxRating = Math.min(Math.max(rawObj.max_rating, 1), 10)
        } else if (typeof rawObj.maxRating === 'number') {
          maxRating = Math.min(Math.max(rawObj.maxRating, 1), 10)
        }
      }
    } catch {
      // Fallback
    }

    return { choices, maxRating }
  }

  /**
   * Process raw answers into aggregated question & section analytics
   */
  function processAnalyticsData(
    survey: SurveyRow,
    sections: SectionRow[],
    questions: QuestionRow[],
    responses: ResponseRow[],
    answers: AnswerRow[]
  ): AnalyticsSummary {
    const totalResponses = responses.length
    const totalQuestions = questions.length
    let totalRatingSum = 0
    let totalRatingCount = 0
    let latestSubmission: string | null = null

    if (responses.length > 0) {
      const sorted = [...responses].sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime())
      latestSubmission = sorted[0]?.submitted_at || null
    }

    // Map answers by question_id
    const answersByQuestionId: Record<string, AnswerRow[]> = {}
    for (const ans of answers) {
      if (!answersByQuestionId[ans.question_id]) {
        answersByQuestionId[ans.question_id] = []
      }
      answersByQuestionId[ans.question_id]?.push(ans)
    }

    // Response timestamp map for text feeds
    const responseTimeMap: Record<string, string> = {}
    for (const resp of responses) {
      responseTimeMap[resp.id] = resp.submitted_at
    }

    const questionAnalyticsList: QuestionAnalytics[] = questions.map(q => {
      const qAnswers = answersByQuestionId[q.id] || []
      const { choices, maxRating } = parseQuestionOptions(q.options)

      const qa: QuestionAnalytics = {
        question: q,
        totalAnswers: qAnswers.length,
      }

      if (q.type === 'multiple_choice') {
        const counts: Record<string, number> = {}

        // Initialize known choices
        for (const choice of choices) {
          counts[choice] = 0
        }

        for (const ans of qAnswers) {
          const rawVal = ans.answer_value
          const extractedText = extractOptionText(rawVal)

          if (extractedText) {
            // Check if extracted text contains comma-separated values (for multi-select)
            const splitItems = extractedText.split(',').map(s => s.trim()).filter(Boolean)
            for (const item of splitItems) {
              // Match against known choices (case-insensitive fallback)
              const matchedChoice = choices.find(c => c.toLowerCase() === item.toLowerCase()) || item
              counts[matchedChoice] = (counts[matchedChoice] || 0) + 1
            }
          }
        }

        const totalChoiceAnswers = Object.values(counts).reduce((acc, curr) => acc + curr, 0)
        const choiceStats: ChoiceStat[] = Object.entries(counts).map(([label, count]) => ({
          label,
          count,
          percentage: totalChoiceAnswers > 0 ? Math.round((count / totalChoiceAnswers) * 100) : 0,
        }))

        qa.choiceStats = choiceStats
      } else if (q.type === 'rating') {
        qa.maxRating = maxRating
        const distribution: Record<number, number> = {}
        for (let i = 1; i <= maxRating; i++) {
          distribution[i] = 0
        }

        let ratingSum = 0
        let ratingCount = 0

        for (const ans of qAnswers) {
          const num = Number(ans.answer_value)
          if (!isNaN(num) && num >= 1 && num <= maxRating) {
            distribution[num] = (distribution[num] || 0) + 1
            ratingSum += num
            ratingCount++
            totalRatingSum += num
            totalRatingCount++
          }
        }

        qa.averageRating = ratingCount > 0 ? Number((ratingSum / ratingCount).toFixed(1)) : 0
        qa.ratingDistribution = distribution
      } else if (q.type === 'short_text' || q.type === 'long_text') {
        qa.textResponses = qAnswers
          .map(ans => ({
            responseId: ans.response_id,
            iterationIndex: ans.iteration_index,
            value: extractOptionText(ans.answer_value),
            submittedAt: responseTimeMap[ans.response_id] || ans.created_at,
          }))
          .filter(item => item.value && item.value.trim() !== '')
      }

      return qa
    })

    // Calculate Section-level summaries
    const sectionSummaries: SectionAnalyticsSummary[] = sections.map((sec, secIdx) => {
      const secQuestions = questions.filter(q => q.section_id === sec.id)
      const secQuestionAnalytics = questionAnalyticsList.filter(qa => qa.question.section_id === sec.id)

      let secRatingSum = 0
      let secRatingCount = 0
      let secRatingQuestionCount = 0
      let secRatingMaxScale = 5

      let highestChoice: { label: string; count: number; percentage: number; questionText: string } | null = null
      let textResponseCount = 0
      let secTotalAnswers = 0

      for (const qa of secQuestionAnalytics) {
        secTotalAnswers += qa.totalAnswers

        if (qa.question.type === 'rating') {
          secRatingQuestionCount++
          if (qa.maxRating) secRatingMaxScale = qa.maxRating
          if (qa.ratingDistribution) {
            for (const [starStr, count] of Object.entries(qa.ratingDistribution)) {
              const star = Number(starStr)
              secRatingSum += star * count
              secRatingCount += count
            }
          }
        } else if (qa.question.type === 'multiple_choice' && qa.choiceStats) {
          for (const stat of qa.choiceStats) {
            if (!highestChoice || stat.count > highestChoice.count) {
              highestChoice = {
                label: stat.label,
                count: stat.count,
                percentage: stat.percentage,
                questionText: qa.question.question_text,
              }
            }
          }
        } else if ((qa.question.type === 'short_text' || qa.question.type === 'long_text') && qa.textResponses) {
          textResponseCount += qa.textResponses.length
        }
      }

      const ratingAverage = secRatingCount > 0 ? Number((secRatingSum / secRatingCount).toFixed(1)) : null

      return {
        section: sec,
        sectionIndex: secIdx + 1,
        questionAnalyticsList: secQuestionAnalytics,
        ratingCount: secRatingCount,
        ratingAverage,
        ratingMaxScale: secRatingMaxScale,
        ratingQuestionCount: secRatingQuestionCount,
        topChoice: highestChoice || undefined,
        textResponseCount,
        totalAnswersCount: secTotalAnswers,
        questionCount: secQuestions.length,
      }
    })

    const averageRatingOverall = totalRatingCount > 0 ? Number((totalRatingSum / totalRatingCount).toFixed(1)) : null

    return {
      survey,
      sections,
      questions,
      totalResponses,
      totalQuestions,
      averageRatingOverall,
      latestSubmission,
      questionAnalytics: questionAnalyticsList,
      sectionSummaries,
    }
  }

  /**
   * Fetch survey analytics summary from Supabase
   */
  async function fetchAnalytics(surveyId: string): Promise<{ data: AnalyticsSummary | null; error: string | null }> {
    if (!surveyId) {
      return { data: null, error: 'ID survei tidak valid.' }
    }

    try {
      // 1. Fetch survey
      const { data: survey, error: surveyErr } = await supabase
        .from('surveys')
        .select('*')
        .eq('id', surveyId)
        .single()

      if (surveyErr || !survey) {
        return { data: null, error: surveyErr?.message || 'Survei tidak ditemukan.' }
      }

      // 2. Fetch sections ordered by section order_index
      const { data: sections } = await supabase
        .from('sections')
        .select('*')
        .eq('survey_id', surveyId)
        .order('order_index', { ascending: true })

      const sectionList = sections || []
      const sectionOrderMap: Record<string, number> = {}
      sectionList.forEach((sec, idx) => {
        sectionOrderMap[sec.id] = sec.order_index ?? idx
      })

      // 3. Fetch questions ordered strictly by Section order_index THEN Question order_index
      let questions: QuestionRow[] = []
      if (sectionList.length > 0) {
        const { data: qData } = await supabase
          .from('questions')
          .select('*')
          .in('section_id', Object.keys(sectionOrderMap))

        if (qData) {
          questions = [...qData].sort((a, b) => {
            const secOrderA = sectionOrderMap[a.section_id] ?? 0
            const secOrderB = sectionOrderMap[b.section_id] ?? 0
            if (secOrderA !== secOrderB) {
              return secOrderA - secOrderB
            }
            return (a.order_index ?? 0) - (b.order_index ?? 0)
          })
        }
      }

      // 4. Fetch responses
      const { data: responses, error: respErr } = await supabase
        .from('responses')
        .select('*')
        .eq('survey_id', surveyId)
        .order('submitted_at', { ascending: false })

      if (respErr) {
        return { data: null, error: respErr.message }
      }

      const responseList = responses || []
      const responseIds = responseList.map(r => r.id)

      let answers: AnswerRow[] = []
      if (responseIds.length > 0) {
        const { data: ansData } = await supabase
          .from('answers')
          .select('*')
          .in('response_id', responseIds)
        answers = ansData || []
      }

      const summary = processAnalyticsData(survey, sectionList, questions, responseList, answers)
      return { data: summary, error: null }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan saat memuat data analitik.'
      return { data: null, error: msg }
    }
  }

  /**
   * Fetch detailed response rows for UTable grid view
   */
  async function fetchDetailedResponses(surveyId: string): Promise<{
    data: {
      responses: DetailedResponseRow[]
      questions: QuestionRow[]
      sections: SectionRow[]
    } | null
    error: string | null
  }> {
    if (!surveyId) {
      return { data: null, error: 'ID survei tidak valid.' }
    }

    try {
      // Fetch sections & questions
      const { data: sections } = await supabase
        .from('sections')
        .select('*')
        .eq('survey_id', surveyId)
        .order('order_index', { ascending: true })

      const sectionList = sections || []
      const sectionOrderMap: Record<string, number> = {}
      sectionList.forEach((sec, idx) => {
        sectionOrderMap[sec.id] = sec.order_index ?? idx
      })

      let questions: QuestionRow[] = []
      if (sectionList.length > 0) {
        const { data: qData } = await supabase
          .from('questions')
          .select('*')
          .in('section_id', Object.keys(sectionOrderMap))

        if (qData) {
          questions = [...qData].sort((a, b) => {
            const secOrderA = sectionOrderMap[a.section_id] ?? 0
            const secOrderB = sectionOrderMap[b.section_id] ?? 0
            if (secOrderA !== secOrderB) {
              return secOrderA - secOrderB
            }
            return (a.order_index ?? 0) - (b.order_index ?? 0)
          })
        }
      }

      // Fetch responses
      const { data: responses, error: respErr } = await supabase
        .from('responses')
        .select('*')
        .eq('survey_id', surveyId)
        .order('submitted_at', { ascending: false })

      if (respErr) {
        return { data: null, error: respErr.message }
      }

      const responseList = responses || []
      const responseIds = responseList.map(r => r.id)

      let answers: AnswerRow[] = []
      if (responseIds.length > 0) {
        const { data: ansData } = await supabase
          .from('answers')
          .select('*')
          .in('response_id', responseIds)
        answers = ansData || []
      }

      // Group answers per response
      const answersByResponse: Record<string, AnswerRow[]> = {}
      for (const ans of answers) {
        if (!answersByResponse[ans.response_id]) {
          answersByResponse[ans.response_id] = []
        }
        answersByResponse[ans.response_id]?.push(ans)
      }

      const detailedRows: DetailedResponseRow[] = responseList.map(resp => {
        const respAnswers = answersByResponse[resp.id] || []
        const answersMap: Record<string, string[]> = {}

        for (const ans of respAnswers) {
          if (!answersMap[ans.question_id]) {
            answersMap[ans.question_id] = []
          }
          const cleanText = extractOptionText(ans.answer_value)
          if (cleanText) {
            answersMap[ans.question_id]?.push(cleanText)
          }
        }

        return {
          responseId: resp.id,
          submittedAt: resp.submitted_at,
          answersCount: respAnswers.length,
          answersMap,
          rawAnswers: respAnswers,
        }
      })

      return {
        data: {
          responses: detailedRows,
          questions,
          sections: sectionList,
        },
        error: null,
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal memuat detail respon.'
      return { data: null, error: msg }
    }
  }

  /**
   * Format responses into clean array of objects adhering to csv-generator.md skills
   * Grouped per Section in column headers (e.g. "[Section 1: Judul Section] P1: Teks Pertanyaan")
   * Short ID format (e.g. "#042d544c") instead of long UUID
   */
  function formatResponsesForCSV(
    questions: QuestionRow[],
    responses: DetailedResponseRow[],
    sections?: SectionRow[]
  ): Array<Record<string, string>> {
    const sectionMap: Record<string, { index: number; title: string }> = {}
    if (sections && sections.length > 0) {
      sections.forEach((sec, idx) => {
        sectionMap[sec.id] = {
          index: idx + 1,
          title: sec.title,
        }
      })
    }

    return responses.map((resp, index) => {
      const shortId = resp.responseId ? `#${resp.responseId.slice(0, 8)}` : '-'
      const row: Record<string, string> = {
        'No': String(index + 1),
        'ID Respon': shortId,
        'Waktu Submit': formatFriendlyDate(resp.submittedAt),
      }

      for (let qIdx = 0; qIdx < questions.length; qIdx++) {
        const q = questions[qIdx]
        if (!q) continue
        const secInfo = sectionMap[q.section_id]
        const secPrefix = secInfo ? `[Section ${secInfo.index}: ${secInfo.title}] ` : ''
        const qHeader = `${secPrefix}P${qIdx + 1}: ${q.question_text}`
        const ansList = resp.answersMap[q.id] || []
        
        if (ansList.length > 0) {
          // Clean quotes and replace newlines
          const combined = ansList.join(' | ').replace(/[\r\n]+/g, ' ').trim()
          row[qHeader] = combined || '-'
        } else {
          row[qHeader] = '-'
        }
      }

      return row
    })
  }

/**
 * Helper to convert array of objects into CSV format with quoted fields
 */
function unparseCSV(rows: Record<string, any>[]): string {
  if (!rows || rows.length === 0) return ''
  const headers = Object.keys(rows[0])
  const headerRow = headers.map(h => `"${String(h).replace(/"/g, '""')}"`).join(',')
  const dataRows = rows.map(row => {
    return headers.map(h => {
      const val = row[h] ?? ''
      return `"${String(val).replace(/"/g, '""')}"`
    }).join(',')
  })
  return [headerRow, ...dataRows].join('\r\n')
}

  /**
   * Export survey responses to CSV file using unparseCSV + UTF-8 BOM
   */
  async function exportToCSV(surveyId: string, surveyTitle = 'survei'): Promise<{ success: boolean; error: string | null }> {
    const { data, error } = await fetchDetailedResponses(surveyId)

    if (error || !data) {
      return { success: false, error: error || 'Tidak dapat mengambil data me-export.' }
    }

    if (data.responses.length === 0) {
      return { success: false, error: 'Belum ada data respon yang dapat diekspor.' }
    }

    try {
      const csvData = formatResponsesForCSV(data.questions, data.responses, data.sections)
      const csvString = unparseCSV(csvData)

      // Add UTF-8 BOM (\ufeff) for Excel compatibility (csv-generator.md requirement 2.1)
      const blob = new Blob(['\uFEFF' + csvString], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const sanitizedTitle = surveyTitle.toLowerCase().replace(/[^a-z0-9]/g, '_')
      const fileName = `formly_${sanitizedTitle}_${new Date().toISOString().slice(0, 10)}.csv`

      const link = document.createElement('a')
      link.setAttribute('href', url)
      link.setAttribute('download', fileName)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      return { success: true, error: null }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan saat memproses file CSV.'
      return { success: false, error: msg }
    }
  }

  return {
    parseQuestionOptions,
    processAnalyticsData,
    fetchAnalytics,
    fetchDetailedResponses,
    formatResponsesForCSV,
    exportToCSV,
    unparseCSV,
  }
}
