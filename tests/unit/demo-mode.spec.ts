import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useDemoState } from '~/composables/useDemoState'
import { useDemoMode } from '~/composables/useDemoMode'

describe('useDemoState Unit Tests', () => {
  beforeEach(() => {
    const demo = useDemoState()
    demo.resetToDefault()
  })

  it('initializes with pre-seeded demo surveys', () => {
    const demo = useDemoState()
    const surveys = demo.getSurveys()

    expect(surveys.length).toBeGreaterThanOrEqual(2)
    expect(surveys.some((s) => s.id === 'demo-survey-1')).toBe(true)
    expect(surveys.some((s) => s.id === 'demo-survey-2')).toBe(true)
  })

  it('can fetch survey by ID with sections, questions, and responses', () => {
    const demo = useDemoState()
    const survey = demo.getSurveyById('demo-survey-1')
    expect(survey).toBeDefined()
    expect(survey?.title).toContain('Survei Kepuasan Layanan')

    const sections = demo.getSections('demo-survey-1')
    expect(sections.length).toBe(3)

    const questions = demo.getQuestions('demo-survey-1')
    expect(questions.length).toBeGreaterThan(3)

    const responses = demo.getResponses('demo-survey-1')
    expect(responses.length).toBe(6)

    const answers = demo.getAnswers('demo-survey-1')
    expect(answers.length).toBeGreaterThan(10)
  })

  it('can create, toggle status, and delete demo surveys in-memory', () => {
    const demo = useDemoState()
    const newSurvey = demo.createSurvey('Survei Testing In-Memory', 'Deskripsi singkat')

    expect(newSurvey.id).toMatch(/^demo-survey-/)
    expect(newSurvey.title).toBe('Survei Testing In-Memory')

    // Initial section should be created
    const sections = demo.getSections(newSurvey.id)
    expect(sections.length).toBe(1)
    expect(sections[0].title).toBe('Section 1')

    // Toggle status
    const updated = demo.updateSurvey(newSurvey.id, { is_active: false })
    expect(updated?.is_active).toBe(false)

    // Delete survey
    const deleted = demo.deleteSurvey(newSurvey.id)
    expect(deleted).toBe(true)
    expect(demo.getSurveyById(newSurvey.id)).toBeNull()
  })

  it('can create and manage sections and questions in-memory', () => {
    const demo = useDemoState()
    const sec = demo.createSection('demo-survey-1', 'Section Baru')
    expect(sec.title).toBe('Section Baru')

    const q = demo.createQuestion(sec.id, {
      question_text: 'Bagaimana pengalaman Anda?',
      type: 'rating',
      is_required: true,
      options: { max_rating: 5 },
    })
    expect(q.question_text).toBe('Bagaimana pengalaman Anda?')
    expect(q.type).toBe('rating')

    // Update question
    const updatedQ = demo.updateQuestion(q.id, { question_text: 'Pertanyaan Diedit' })
    expect(updatedQ?.question_text).toBe('Pertanyaan Diedit')

    // Delete question
    const deletedQ = demo.deleteQuestion(q.id)
    expect(deletedQ).toBe(true)
  })

  it('can submit demo responses and record answers in-memory', () => {
    const demo = useDemoState()
    const initialResponses = demo.getResponses('demo-survey-1').length

    const newResp = demo.submitDemoResponse('demo-survey-1', {
      'demo-q1': 5,
      'demo-q2': 'Sangat Puas',
    })

    expect(newResp).toBeDefined()
    expect(newResp.survey_id).toBe('demo-survey-1')

    const updatedResponses = demo.getResponses('demo-survey-1')
    expect(updatedResponses.length).toBe(initialResponses + 1)

    const answers = demo.getAnswers('demo-survey-1')
    const responseAnswers = answers.filter((a) => a.response_id === newResp.id)
    expect(responseAnswers.length).toBe(2)
  })

  it('resets state completely on clearDemoState', () => {
    const demo = useDemoState()
    demo.createSurvey('Survei Tambahan')
    demo.clearDemoState()

    const surveys = demo.getSurveys()
    // Cleared state restores fresh seed data
    expect(surveys.length).toBe(2)
  })
})

describe('useDemoMode Unit Tests', () => {
  it('correctly appends demo query to strings and route objects', () => {
    vi.stubGlobal('useRoute', () => ({
      params: { id: 'demo-survey-1' },
      query: { demo: 'true' },
      path: '/admin/dashboard',
    }))

    const demoMode = useDemoMode()

    expect(demoMode.withDemoQuery('/admin/dashboard')).toBe('/admin/dashboard?demo=true')
    expect(demoMode.withDemoQuery('/admin/survey/create')).toBe('/admin/survey/create?demo=true')
    expect(demoMode.withDemoQuery('/admin/survey/123/edit?preview=true')).toBe('/admin/survey/123/edit?preview=true&demo=true')

    const routeObj = demoMode.withDemoQuery({ path: '/admin/dashboard', query: { tab: 'canvas' } })
    expect(routeObj).toEqual({ path: '/admin/dashboard', query: { tab: 'canvas', demo: 'true' } })
  })
})
