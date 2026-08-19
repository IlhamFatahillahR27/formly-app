import type { SurveyRow, SectionRow, QuestionRow, SectionLogicRow, ResponseRow, AnswerRow, Json } from '~/types/supabase'
import type { SurveyWithStats } from '~/composables/useSurveys'

// Initial Seed Data for Demo Surveys
export const INITIAL_DEMO_SURVEYS: SurveyWithStats[] = [
  {
    id: 'demo-survey-1',
    admin_id: 'demo-guest-admin',
    title: 'Survei Kepuasan Layanan & Evaluasi Pelanggan (Demo)',
    description: 'Survei interaktif untuk mengevaluasi kepuasan layanan, kualitas fitur, serta alur form percabangan logic.',
    is_active: true,
    cover_image_url: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=1200&q=80',
    start_section_id: 'demo-sec-1',
    created_at: '2026-08-15T09:00:00.000Z',
    updated_at: '2026-08-15T09:00:00.000Z',
    section_count: 3,
    response_count: 6,
  },
  {
    id: 'demo-survey-2',
    admin_id: 'demo-guest-admin',
    title: 'Survei Pendaftaran Event & Workshop Tech 2026 (Demo)',
    description: 'Formulir registrasi dan pemilihan topik workshop untuk praktisi teknologi dan software engineer.',
    is_active: true,
    cover_image_url: null,
    start_section_id: 'demo-sec-2-1',
    created_at: '2026-08-16T14:30:00.000Z',
    updated_at: '2026-08-16T14:30:00.000Z',
    section_count: 2,
    response_count: 4,
  },
]

export const INITIAL_DEMO_SECTIONS: Record<string, SectionRow[]> = {
  'demo-survey-1': [
    {
      id: 'demo-sec-1',
      survey_id: 'demo-survey-1',
      title: 'Informasi & Profil Pengguna',
      description: 'Bagian perkenalan singkat mengenai identitas dan sumber informasi Anda.',
      order_index: 0,
      position_x: 100,
      position_y: 100,
      is_end_section: false,
      default_next_section_id: 'demo-sec-2',
      created_at: '2026-08-15T09:00:00.000Z',
      updated_at: '2026-08-15T09:00:00.000Z',
    },
    {
      id: 'demo-sec-2',
      survey_id: 'demo-survey-1',
      title: 'Penilaian Kualitas & Kepuasan',
      description: 'Berikan evaluasi terhadap kemudahan dan performa fitur Formly.',
      order_index: 1,
      position_x: 460,
      position_y: 100,
      is_end_section: false,
      default_next_section_id: 'demo-sec-3',
      created_at: '2026-08-15T09:05:00.000Z',
      updated_at: '2026-08-15T09:05:00.000Z',
    },
    {
      id: 'demo-sec-3',
      survey_id: 'demo-survey-1',
      title: 'Feedback & Masukan Fitur',
      description: 'Bantu kami meningkatkan kualitas platform dengan aspirasi dan masukan Anda.',
      order_index: 2,
      position_x: 820,
      position_y: 100,
      is_end_section: true,
      default_next_section_id: null,
      created_at: '2026-08-15T09:10:00.000Z',
      updated_at: '2026-08-15T09:10:00.000Z',
    },
  ],
  'demo-survey-2': [
    {
      id: 'demo-sec-2-1',
      survey_id: 'demo-survey-2',
      title: 'Pilihan Topik & Jalur Workshop',
      description: 'Pilih fokus materi yang paling sesuai dengan kebutuhan karir Anda.',
      order_index: 0,
      position_x: 100,
      position_y: 100,
      is_end_section: false,
      default_next_section_id: 'demo-sec-2-2',
      created_at: '2026-08-16T14:30:00.000Z',
      updated_at: '2026-08-16T14:30:00.000Z',
    },
    {
      id: 'demo-sec-2-2',
      survey_id: 'demo-survey-2',
      title: 'Konfirmasi & Ekspektasi Peserta',
      description: 'Ekspektasi dan latar belakang kemampuan sebelum mengikuti sesi.',
      order_index: 1,
      position_x: 460,
      position_y: 100,
      is_end_section: true,
      default_next_section_id: null,
      created_at: '2026-08-16T14:35:00.000Z',
      updated_at: '2026-08-16T14:35:00.000Z',
    },
  ],
}

export const INITIAL_DEMO_QUESTIONS: Record<string, QuestionRow[]> = {
  'demo-survey-1': [
    {
      id: 'demo-q-1',
      section_id: 'demo-sec-1',
      question_text: 'Siapa nama lengkap atau panggilan Anda?',
      type: 'short_text',
      is_required: true,
      options: null,
      order_index: 0,
      created_at: '2026-08-15T09:01:00.000Z',
      updated_at: '2026-08-15T09:01:00.000Z',
    },
    {
      id: 'demo-q-2',
      section_id: 'demo-sec-1',
      question_text: 'Dari mana Anda pertama kali mengetahui layanan Formly?',
      type: 'multiple_choice',
      is_required: true,
      options: [
        { id: 'opt_medsos', text: 'Media Sosial (LinkedIn / Twitter)' },
        { id: 'opt_rekomendasi', text: 'Rekomendasi Rekan Kerja / Komunitas' },
        { id: 'opt_google', text: 'Pencarian Google / Artikel Tech' },
        { id: 'opt_event', text: 'Event / Webinar' },
      ],
      order_index: 1,
      created_at: '2026-08-15T09:02:00.000Z',
      updated_at: '2026-08-15T09:02:00.000Z',
    },
    {
      id: 'demo-q-3',
      section_id: 'demo-sec-2',
      question_text: 'Berapa rating kepuasan Anda terhadap kemudahan membuat alur form di Formly?',
      type: 'rating',
      is_required: true,
      options: { max_rating: 5 },
      order_index: 0,
      created_at: '2026-08-15T09:06:00.000Z',
      updated_at: '2026-08-15T09:06:00.000Z',
    },
    {
      id: 'demo-q-4',
      section_id: 'demo-sec-2',
      question_text: 'Apakah alur diagram canvas membantu visualisasi logika percabangan Anda?',
      type: 'multiple_choice',
      is_required: true,
      options: [
        { id: 'opt_help_very', text: 'Sangat Membantu' },
        { id: 'opt_help_mod', text: 'Cukup Membantu' },
        { id: 'opt_help_need_imp', text: 'Perlu Peningkatan' },
      ],
      order_index: 1,
      created_at: '2026-08-15T09:07:00.000Z',
      updated_at: '2026-08-15T09:07:00.000Z',
    },
    {
      id: 'demo-q-5',
      section_id: 'demo-sec-3',
      question_text: 'Apa saran atau fitur tambahan yang paling Anda harapkan hadir di Formly?',
      type: 'long_text',
      is_required: false,
      options: null,
      order_index: 0,
      created_at: '2026-08-15T09:11:00.000Z',
      updated_at: '2026-08-15T09:11:00.000Z',
    },
  ],
  'demo-survey-2': [
    {
      id: 'demo-q-2-1',
      section_id: 'demo-sec-2-1',
      question_text: 'Pilih track workshop yang ingin Anda ikuti:',
      type: 'multiple_choice',
      is_required: true,
      options: [
        { id: 'track_fe', text: 'Frontend Architecture & Nuxt 4' },
        { id: 'track_ai', text: 'AI Agentic Coding & LLMs' },
        { id: 'track_devops', text: 'Cloud, Supabase & Microservices' },
      ],
      order_index: 0,
      created_at: '2026-08-16T14:31:00.000Z',
      updated_at: '2026-08-16T14:31:00.000Z',
    },
    {
      id: 'demo-q-2-2',
      section_id: 'demo-sec-2-2',
      question_text: 'Tingkat penguasaan Anda pada materi yang dipilih saat ini:',
      type: 'rating',
      is_required: true,
      options: { max_rating: 5 },
      order_index: 0,
      created_at: '2026-08-16T14:36:00.000Z',
      updated_at: '2026-08-16T14:36:00.000Z',
    },
    {
      id: 'demo-q-2-3',
      section_id: 'demo-sec-2-2',
      question_text: 'Tuliskan topik khusus atau problem nyata yang ingin dibahas saat sesi tanya jawab:',
      type: 'short_text',
      is_required: false,
      options: null,
      order_index: 1,
      created_at: '2026-08-16T14:37:00.000Z',
      updated_at: '2026-08-16T14:37:00.000Z',
    },
  ],
}

export const INITIAL_DEMO_LOGIC_RULES: Record<string, SectionLogicRow[]> = {
  'demo-survey-1': [
    {
      id: 'demo-rule-1',
      survey_id: 'demo-survey-1',
      source_section_id: 'demo-sec-2',
      question_id: 'demo-q-4',
      operator: 'selected',
      condition_value: 'opt_help_need_imp',
      target_section_id: 'demo-sec-3',
      created_at: '2026-08-15T09:08:00.000Z',
      updated_at: '2026-08-15T09:08:00.000Z',
    },
  ],
  'demo-survey-2': [],
}

export const INITIAL_DEMO_RESPONSES: Record<string, ResponseRow[]> = {
  'demo-survey-1': [
    { id: 'demo-resp-1', survey_id: 'demo-survey-1', submitted_at: '2026-08-18T10:15:00.000Z', created_at: '2026-08-18T10:15:00.000Z' },
    { id: 'demo-resp-2', survey_id: 'demo-survey-1', submitted_at: '2026-08-18T11:45:00.000Z', created_at: '2026-08-18T11:45:00.000Z' },
    { id: 'demo-resp-3', survey_id: 'demo-survey-1', submitted_at: '2026-08-18T14:20:00.000Z', created_at: '2026-08-18T14:20:00.000Z' },
    { id: 'demo-resp-4', survey_id: 'demo-survey-1', submitted_at: '2026-08-18T16:05:00.000Z', created_at: '2026-08-18T16:05:00.000Z' },
    { id: 'demo-resp-5', survey_id: 'demo-survey-1', submitted_at: '2026-08-18T18:30:00.000Z', created_at: '2026-08-18T18:30:00.000Z' },
    { id: 'demo-resp-6', survey_id: 'demo-survey-1', submitted_at: '2026-08-18T20:10:00.000Z', created_at: '2026-08-18T20:10:00.000Z' },
  ],
  'demo-survey-2': [
    { id: 'demo-resp-2-1', survey_id: 'demo-survey-2', submitted_at: '2026-08-17T09:20:00.000Z', created_at: '2026-08-17T09:20:00.000Z' },
    { id: 'demo-resp-2-2', survey_id: 'demo-survey-2', submitted_at: '2026-08-17T13:40:00.000Z', created_at: '2026-08-17T13:40:00.000Z' },
    { id: 'demo-resp-2-3', survey_id: 'demo-survey-2', submitted_at: '2026-08-17T16:15:00.000Z', created_at: '2026-08-17T16:15:00.000Z' },
    { id: 'demo-resp-2-4', survey_id: 'demo-survey-2', submitted_at: '2026-08-17T19:50:00.000Z', created_at: '2026-08-17T19:50:00.000Z' },
  ],
}

export const INITIAL_DEMO_ANSWERS: Record<string, AnswerRow[]> = {
  'demo-survey-1': [
    // Resp 1: Budi Santoso
    { id: 'ans-1-1', response_id: 'demo-resp-1', question_id: 'demo-q-1', answer_value: 'Budi Santoso', iteration_index: 1, created_at: '2026-08-18T10:15:00.000Z' },
    { id: 'ans-1-2', response_id: 'demo-resp-1', question_id: 'demo-q-2', answer_value: 'Media Sosial (LinkedIn / Twitter)', iteration_index: 1, created_at: '2026-08-18T10:15:00.000Z' },
    { id: 'ans-1-3', response_id: 'demo-resp-1', question_id: 'demo-q-3', answer_value: '5', iteration_index: 1, created_at: '2026-08-18T10:15:00.000Z' },
    { id: 'ans-1-4', response_id: 'demo-resp-1', question_id: 'demo-q-4', answer_value: 'Sangat Membantu', iteration_index: 1, created_at: '2026-08-18T10:15:00.000Z' },
    { id: 'ans-1-5', response_id: 'demo-resp-1', question_id: 'demo-q-5', answer_value: 'Tambahkan integrasi webhook ke Slack / Discord.', iteration_index: 1, created_at: '2026-08-18T10:15:00.000Z' },

    // Resp 2: Siti Rahma
    { id: 'ans-2-1', response_id: 'demo-resp-2', question_id: 'demo-q-1', answer_value: 'Siti Rahma', iteration_index: 1, created_at: '2026-08-18T11:45:00.000Z' },
    { id: 'ans-2-2', response_id: 'demo-resp-2', question_id: 'demo-q-2', answer_value: 'Rekomendasi Rekan Kerja / Komunitas', iteration_index: 1, created_at: '2026-08-18T11:45:00.000Z' },
    { id: 'ans-2-3', response_id: 'demo-resp-2', question_id: 'demo-q-3', answer_value: '4', iteration_index: 1, created_at: '2026-08-18T11:45:00.000Z' },
    { id: 'ans-2-4', response_id: 'demo-resp-2', question_id: 'demo-q-4', answer_value: 'Sangat Membantu', iteration_index: 1, created_at: '2026-08-18T11:45:00.000Z' },
    { id: 'ans-2-5', response_id: 'demo-resp-2', question_id: 'demo-q-5', answer_value: 'UI canvas designer sangat intuitif dan responsif!', iteration_index: 1, created_at: '2026-08-18T11:45:00.000Z' },

    // Resp 3: Dimas Pratama
    { id: 'ans-3-1', response_id: 'demo-resp-3', question_id: 'demo-q-1', answer_value: 'Dimas Pratama', iteration_index: 1, created_at: '2026-08-18T14:20:00.000Z' },
    { id: 'ans-3-2', response_id: 'demo-resp-3', question_id: 'demo-q-2', answer_value: 'Pencarian Google / Artikel Tech', iteration_index: 1, created_at: '2026-08-18T14:20:00.000Z' },
    { id: 'ans-3-3', response_id: 'demo-resp-3', question_id: 'demo-q-3', answer_value: '5', iteration_index: 1, created_at: '2026-08-18T14:20:00.000Z' },
    { id: 'ans-3-4', response_id: 'demo-resp-3', question_id: 'demo-q-4', answer_value: 'Cukup Membantu', iteration_index: 1, created_at: '2026-08-18T14:20:00.000Z' },
    { id: 'ans-3-5', response_id: 'demo-resp-3', question_id: 'demo-q-5', answer_value: 'Mohon dukung template survei yang siap pakai.', iteration_index: 1, created_at: '2026-08-18T14:20:00.000Z' },

    // Resp 4: Anisa Putri
    { id: 'ans-4-1', response_id: 'demo-resp-4', question_id: 'demo-q-1', answer_value: 'Anisa Putri', iteration_index: 1, created_at: '2026-08-18T16:05:00.000Z' },
    { id: 'ans-4-2', response_id: 'demo-resp-4', question_id: 'demo-q-2', answer_value: 'Event / Webinar', iteration_index: 1, created_at: '2026-08-18T16:05:00.000Z' },
    { id: 'ans-4-3', response_id: 'demo-resp-4', question_id: 'demo-q-3', answer_value: '4', iteration_index: 1, created_at: '2026-08-18T16:05:00.000Z' },
    { id: 'ans-4-4', response_id: 'demo-resp-4', question_id: 'demo-q-4', answer_value: 'Sangat Membantu', iteration_index: 1, created_at: '2026-08-18T16:05:00.000Z' },

    // Resp 5: Rizky Fajar
    { id: 'ans-5-1', response_id: 'demo-resp-5', question_id: 'demo-q-1', answer_value: 'Rizky Fajar', iteration_index: 1, created_at: '2026-08-18T18:30:00.000Z' },
    { id: 'ans-5-2', response_id: 'demo-resp-5', question_id: 'demo-q-2', answer_value: 'Media Sosial (LinkedIn / Twitter)', iteration_index: 1, created_at: '2026-08-18T18:30:00.000Z' },
    { id: 'ans-5-3', response_id: 'demo-resp-5', question_id: 'demo-q-3', answer_value: '3', iteration_index: 1, created_at: '2026-08-18T18:30:00.000Z' },
    { id: 'ans-5-4', response_id: 'demo-resp-5', question_id: 'demo-q-4', answer_value: 'Perlu Peningkatan', iteration_index: 1, created_at: '2026-08-18T18:30:00.000Z' },
    { id: 'ans-5-5', response_id: 'demo-resp-5', question_id: 'demo-q-5', answer_value: 'Bisa dipercepat render node jika survey memiliki lebih dari 20 section.', iteration_index: 1, created_at: '2026-08-18T18:30:00.000Z' },

    // Resp 6: Maya Indah
    { id: 'ans-6-1', response_id: 'demo-resp-6', question_id: 'demo-q-1', answer_value: 'Maya Indah', iteration_index: 1, created_at: '2026-08-18T20:10:00.000Z' },
    { id: 'ans-6-2', response_id: 'demo-resp-6', question_id: 'demo-q-2', answer_value: 'Rekomendasi Rekan Kerja / Komunitas', iteration_index: 1, created_at: '2026-08-18T20:10:00.000Z' },
    { id: 'ans-6-3', response_id: 'demo-resp-6', question_id: 'demo-q-3', answer_value: '5', iteration_index: 1, created_at: '2026-08-18T20:10:00.000Z' },
    { id: 'ans-6-4', response_id: 'demo-resp-6', question_id: 'demo-q-4', answer_value: 'Sangat Membantu', iteration_index: 1, created_at: '2026-08-18T20:10:00.000Z' },
    { id: 'ans-6-5', response_id: 'demo-resp-6', question_id: 'demo-q-5', answer_value: 'Ekspor CSV dengan UTF-8 BOM bekerja sempurna di Microsoft Excel!', iteration_index: 1, created_at: '2026-08-18T20:10:00.000Z' },
  ],
  'demo-survey-2': [
    { id: 'ans-2-1-1', response_id: 'demo-resp-2-1', question_id: 'demo-q-2-1', answer_value: 'Frontend Architecture & Nuxt 4', iteration_index: 1, created_at: '2026-08-17T09:20:00.000Z' },
    { id: 'ans-2-1-2', response_id: 'demo-resp-2-1', question_id: 'demo-q-2-2', answer_value: '4', iteration_index: 1, created_at: '2026-08-17T09:20:00.000Z' },
    { id: 'ans-2-1-3', response_id: 'demo-resp-2-1', question_id: 'demo-q-2-3', answer_value: 'Best practice Nuxt 4 server component dan cache handling.', iteration_index: 1, created_at: '2026-08-17T09:20:00.000Z' },

    { id: 'ans-2-2-1', response_id: 'demo-resp-2-2', question_id: 'demo-q-2-1', answer_value: 'AI Agentic Coding & LLMs', iteration_index: 1, created_at: '2026-08-17T13:40:00.000Z' },
    { id: 'ans-2-2-2', response_id: 'demo-resp-2-2', question_id: 'demo-q-2-2', answer_value: '5', iteration_index: 1, created_at: '2026-08-17T13:40:00.000Z' },

    { id: 'ans-2-3-1', response_id: 'demo-resp-2-3', question_id: 'demo-q-2-1', answer_value: 'Cloud, Supabase & Microservices', iteration_index: 1, created_at: '2026-08-17T16:15:00.000Z' },
    { id: 'ans-2-3-2', response_id: 'demo-resp-2-3', question_id: 'demo-q-2-2', answer_value: '3', iteration_index: 1, created_at: '2026-08-17T16:15:00.000Z' },

    { id: 'ans-2-4-1', response_id: 'demo-resp-2-4', question_id: 'demo-q-2-1', answer_value: 'AI Agentic Coding & LLMs', iteration_index: 1, created_at: '2026-08-17T19:50:00.000Z' },
    { id: 'ans-2-4-2', response_id: 'demo-resp-2-4', question_id: 'demo-q-2-2', answer_value: '4', iteration_index: 1, created_at: '2026-08-17T19:50:00.000Z' },
  ],
}

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj))
}

function safeUseState<T>(key: string, init: () => T) {
  if (typeof useState === 'function') {
    return useState<T>(key, init)
  }
  return ref<T>(init())
}

export function useDemoState() {
  const demoSurveys = safeUseState<SurveyWithStats[]>('demo_surveys', () => deepClone(INITIAL_DEMO_SURVEYS))
  const demoSections = safeUseState<Record<string, SectionRow[]>>('demo_sections', () => deepClone(INITIAL_DEMO_SECTIONS))
  const demoQuestions = safeUseState<Record<string, QuestionRow[]>>('demo_questions', () => deepClone(INITIAL_DEMO_QUESTIONS))
  const demoLogicRules = safeUseState<Record<string, SectionLogicRow[]>>('demo_logic_rules', () => deepClone(INITIAL_DEMO_LOGIC_RULES))
  const demoResponses = safeUseState<Record<string, ResponseRow[]>>('demo_responses', () => deepClone(INITIAL_DEMO_RESPONSES))
  const demoAnswers = safeUseState<Record<string, AnswerRow[]>>('demo_answers', () => deepClone(INITIAL_DEMO_ANSWERS))

  function resetDemoData() {
    demoSurveys.value = deepClone(INITIAL_DEMO_SURVEYS)
    demoSections.value = deepClone(INITIAL_DEMO_SECTIONS)
    demoQuestions.value = deepClone(INITIAL_DEMO_QUESTIONS)
    demoLogicRules.value = deepClone(INITIAL_DEMO_LOGIC_RULES)
    demoResponses.value = deepClone(INITIAL_DEMO_RESPONSES)
    demoAnswers.value = deepClone(INITIAL_DEMO_ANSWERS)
  }

  function clearDemoState() {
    resetDemoData()
  }

  function resetToDefault() {
    resetDemoData()
  }

  // Survey CRUD
  function getSurveys(): SurveyWithStats[] {
    return demoSurveys.value.map((s) => {
      const sSections = demoSections.value[s.id] || []
      const sResponses = demoResponses.value[s.id] || []
      return {
        ...s,
        section_count: sSections.length,
        response_count: sResponses.length,
      }
    })
  }

  function getSurveyById(surveyId: string): SurveyRow | null {
    return demoSurveys.value.find((s) => s.id === surveyId) || null
  }

  function createSurvey(
    payloadOrTitle: string | { title: string; description?: string | null },
    maybeDescription?: string | null
  ): SurveyRow {
    const title = typeof payloadOrTitle === 'string' ? payloadOrTitle : payloadOrTitle.title
    const description = typeof payloadOrTitle === 'string' ? maybeDescription : payloadOrTitle.description

    const newSurveyId = `demo-survey-${Date.now()}`
    const newSectionId = `demo-sec-${Date.now()}`

    const newSurvey: SurveyRow = {
      id: newSurveyId,
      admin_id: 'demo-guest-admin',
      title: title ? title.trim() : 'Survei Demo Baru',
      description: description?.trim() || null,
      is_active: true,
      cover_image_url: null,
      start_section_id: newSectionId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const newSection: SectionRow = {
      id: newSectionId,
      survey_id: newSurveyId,
      title: 'Section 1',
      description: 'Bagian utama survei',
      position_x: 100,
      position_y: 100,
      order_index: 0,
      is_end_section: false,
      default_next_section_id: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    demoSurveys.value.unshift({
      ...newSurvey,
      section_count: 1,
      response_count: 0,
    })

    demoSections.value[newSurveyId] = [newSection]
    demoQuestions.value[newSurveyId] = []
    demoLogicRules.value[newSurveyId] = []
    demoResponses.value[newSurveyId] = []
    demoAnswers.value[newSurveyId] = []

    return newSurvey
  }

  function updateSurveyHeader(surveyId: string, updates: Partial<Pick<SurveyRow, 'title' | 'description' | 'cover_image_url' | 'start_section_id' | 'is_active'>>): boolean {
    const idx = demoSurveys.value.findIndex((s) => s.id === surveyId)
    if (idx === -1) return false

    const current = demoSurveys.value[idx]
    if (!current) return false

    demoSurveys.value[idx] = {
      ...current,
      ...updates,
      updated_at: new Date().toISOString(),
    }
    return true
  }

  function toggleSurveyStatus(surveyId: string, isActive: boolean): boolean {
    return updateSurveyHeader(surveyId, { is_active: isActive })
  }

  function deleteSurvey(surveyId: string): boolean {
    demoSurveys.value = demoSurveys.value.filter((s) => s.id !== surveyId)
    delete demoSections.value[surveyId]
    delete demoQuestions.value[surveyId]
    delete demoLogicRules.value[surveyId]
    delete demoResponses.value[surveyId]
    delete demoAnswers.value[surveyId]
    return true
  }

  // Section CRUD
  function getSections(surveyId: string): SectionRow[] {
    return (demoSections.value[surveyId] || []).sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
  }

  function createSection(surveyId: string, title?: string): SectionRow | null {
    if (!demoSections.value[surveyId]) {
      demoSections.value[surveyId] = []
    }
    const currentSections = demoSections.value[surveyId] || []
    const newIdx = currentSections.length
    const secId = `demo-sec-${Date.now()}`

    const newSec: SectionRow = {
      id: secId,
      survey_id: surveyId,
      title: title?.trim() || `Section ${newIdx + 1}`,
      description: null,
      position_x: 100 + newIdx * 280,
      position_y: 100,
      order_index: newIdx,
      is_end_section: false,
      default_next_section_id: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    currentSections.push(newSec)

    // If survey had no start section, set it
    const survey = getSurveyById(surveyId)
    if (survey && !survey.start_section_id) {
      updateSurveyHeader(surveyId, { start_section_id: secId })
    }

    return newSec
  }

  function updateSection(sectionId: string, updates: Partial<Omit<SectionRow, 'id' | 'survey_id' | 'created_at' | 'updated_at'>>): SectionRow | null {
    for (const [sId, secList] of Object.entries(demoSections.value)) {
      const idx = secList.findIndex((s) => s.id === sectionId)
      if (idx !== -1 && secList[idx]) {
        const updated = {
          ...secList[idx],
          ...updates,
          updated_at: new Date().toISOString(),
        }
        secList[idx] = updated
        return updated
      }
    }
    return null
  }

  function updateNodePosition(sectionId: string, position_x: number, position_y: number) {
    updateSection(sectionId, { position_x, position_y })
  }

  function deleteSection(sectionId: string): boolean {
    for (const [sId, secList] of Object.entries(demoSections.value)) {
      const idx = secList.findIndex((s) => s.id === sectionId)
      if (idx !== -1) {
        demoSections.value[sId] = secList.filter((s) => s.id !== sectionId)

        // Remove questions in this section
        if (demoQuestions.value[sId]) {
          demoQuestions.value[sId] = demoQuestions.value[sId].filter((q) => q.section_id !== sectionId)
        }

        // Remove logic rules referencing this section
        if (demoLogicRules.value[sId]) {
          demoLogicRules.value[sId] = demoLogicRules.value[sId].filter(
            (l) => l.source_section_id !== sectionId && l.target_section_id !== sectionId
          )
        }

        // Re-assign start section if deleted
        const survey = getSurveyById(sId)
        if (survey && survey.start_section_id === sectionId) {
          const nextStart = demoSections.value[sId]?.[0]?.id || null
          updateSurveyHeader(sId, { start_section_id: nextStart })
        }

        return true
      }
    }
    return false
  }

  function moveSection(surveyId: string, sectionId: string, direction: 'up' | 'down'): boolean {
    const secList = demoSections.value[surveyId]
    if (!secList) return false

    const sorted = [...secList].sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
    const idx = sorted.findIndex((s) => s.id === sectionId)
    if (idx === -1) return false

    const targetIdx = direction === 'up' ? idx - 1 : idx + 1
    if (targetIdx < 0 || targetIdx >= sorted.length) return false

    const currentSec = sorted[idx]
    const neighborSec = sorted[targetIdx]
    if (!currentSec || !neighborSec) return false

    const currentOrder = currentSec.order_index ?? idx
    const neighborOrder = neighborSec.order_index ?? targetIdx

    currentSec.order_index = neighborOrder === currentOrder ? targetIdx : neighborOrder
    neighborSec.order_index = neighborOrder === currentOrder ? idx : currentOrder

    demoSections.value[surveyId] = [...sorted].sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
    return true
  }

  // Question CRUD
  function getQuestions(surveyId: string): QuestionRow[] {
    return demoQuestions.value[surveyId] || []
  }

  function createQuestion(
    surveyIdOrSectionId: string,
    sectionIdOrPayload?: string | Partial<QuestionRow>,
    maybePayload?: Partial<QuestionRow>
  ): QuestionRow {
    let surveyId = surveyIdOrSectionId
    let sectionId = typeof sectionIdOrPayload === 'string' ? sectionIdOrPayload : surveyIdOrSectionId
    let payload: Partial<QuestionRow> = {}

    if (typeof sectionIdOrPayload === 'object' && sectionIdOrPayload !== null) {
      payload = sectionIdOrPayload
      // Find surveyId from section
      for (const [sId, secList] of Object.entries(demoSections.value)) {
        if (secList.some((sec) => sec.id === sectionId)) {
          surveyId = sId
          break
        }
      }
    } else if (maybePayload) {
      payload = maybePayload
    }

    if (!demoQuestions.value[surveyId]) {
      demoQuestions.value[surveyId] = []
    }
    const qList = demoQuestions.value[surveyId] || []
    const secQuestions = qList.filter((q) => q.section_id === sectionId)
    const newIdx = secQuestions.length

    const type = payload.type || 'short_text'
    const questionText = payload.question_text || 'Pertanyaan Baru'
    let options: Json | null = payload.options !== undefined ? (payload.options as Json) : null

    if (options === null) {
      if (type === 'multiple_choice') {
        options = [
          { id: 'opt_1', text: 'Opsi 1' },
          { id: 'opt_2', text: 'Opsi 2' },
        ]
      } else if (type === 'rating') {
        options = { max_rating: 5 }
      }
    }

    const newQ: QuestionRow = {
      id: `demo-q-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      section_id: sectionId,
      question_text: questionText,
      type,
      is_required: payload.is_required !== undefined ? payload.is_required : true,
      options,
      order_index: newIdx,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    demoQuestions.value[surveyId]?.push(newQ)
    return newQ
  }

  function updateQuestion(
    questionId: string,
    updates: Partial<Omit<QuestionRow, 'id' | 'section_id' | 'created_at' | 'updated_at'>>
  ): QuestionRow | null {
    for (const [sId, qList] of Object.entries(demoQuestions.value)) {
      const idx = qList.findIndex((q) => q.id === questionId)
      if (idx !== -1 && qList[idx]) {
        const updated = {
          ...qList[idx],
          ...updates,
          updated_at: new Date().toISOString(),
        }
        qList[idx] = updated
        return updated
      }
    }
    return null
  }

  function deleteQuestion(questionId: string): boolean {
    for (const [sId, qList] of Object.entries(demoQuestions.value)) {
      const idx = qList.findIndex((q) => q.id === questionId)
      if (idx !== -1) {
        demoQuestions.value[sId] = qList.filter((q) => q.id !== questionId)

        // Remove logic rules referencing this question
        if (demoLogicRules.value[sId]) {
          demoLogicRules.value[sId] = demoLogicRules.value[sId].filter((l) => l.question_id !== questionId)
        }
        return true
      }
    }
    return false
  }

  function moveQuestion(questionId: string, direction: 'up' | 'down'): boolean {
    for (const [sId, qList] of Object.entries(demoQuestions.value)) {
      const q = qList.find((item) => item.id === questionId)
      if (!q) continue

      const secQuestions = qList
        .filter((item) => item.section_id === q.section_id)
        .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))

      const idx = secQuestions.findIndex((item) => item.id === questionId)
      if (idx === -1) return false

      const targetIdx = direction === 'up' ? idx - 1 : idx + 1
      if (targetIdx < 0 || targetIdx >= secQuestions.length) return false

      const currentQ = secQuestions[idx]
      const neighborQ = secQuestions[targetIdx]
      if (!currentQ || !neighborQ) return false

      const currentOrder = currentQ.order_index ?? idx
      const neighborOrder = neighborQ.order_index ?? targetIdx

      currentQ.order_index = neighborOrder === currentOrder ? targetIdx : neighborOrder
      neighborQ.order_index = neighborOrder === currentOrder ? idx : currentOrder

      return true
    }
    return false
  }

  // Logic Rule CRUD
  function getLogicRules(surveyId: string): SectionLogicRow[] {
    return demoLogicRules.value[surveyId] || []
  }

  function createLogicRule(
    surveyId: string,
    payload: Omit<SectionLogicRow, 'id' | 'created_at' | 'updated_at' | 'survey_id'>
  ): SectionLogicRow | null {
    if (!demoLogicRules.value[surveyId]) {
      demoLogicRules.value[surveyId] = []
    }
    const newRule: SectionLogicRow = {
      id: `demo-rule-${Date.now()}`,
      survey_id: surveyId,
      source_section_id: payload.source_section_id,
      question_id: payload.question_id,
      operator: payload.operator,
      condition_value: payload.condition_value ?? null,
      target_section_id: payload.target_section_id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    demoLogicRules.value[surveyId]?.push(newRule)
    return newRule
  }

  function updateLogicRule(
    ruleId: string,
    updates: Partial<Omit<SectionLogicRow, 'id' | 'survey_id' | 'created_at' | 'updated_at'>>
  ): SectionLogicRow | null {
    for (const [sId, rules] of Object.entries(demoLogicRules.value)) {
      const idx = rules.findIndex((r) => r.id === ruleId)
      if (idx !== -1 && rules[idx]) {
        const updated = {
          ...rules[idx],
          ...updates,
          updated_at: new Date().toISOString(),
        }
        rules[idx] = updated
        return updated
      }
    }
    return null
  }

  function deleteLogicRule(ruleId: string): boolean {
    for (const [sId, rules] of Object.entries(demoLogicRules.value)) {
      const idx = rules.findIndex((r) => r.id === ruleId)
      if (idx !== -1) {
        demoLogicRules.value[sId] = rules.filter((r) => r.id !== ruleId)
        return true
      }
    }
    return false
  }

  // Responses & Answers
  function getResponses(surveyId: string): ResponseRow[] {
    return (demoResponses.value[surveyId] || []).sort(
      (a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime()
    )
  }

  function getAnswers(surveyId: string): AnswerRow[] {
    return demoAnswers.value[surveyId] || []
  }

  function submitDemoResponse(surveyId: string, answersMap: Record<string, unknown>): ResponseRow {
    const respId = `demo-resp-${Date.now()}`
    const submittedAt = new Date().toISOString()

    const newResp: ResponseRow = {
      id: respId,
      survey_id: surveyId,
      submitted_at: submittedAt,
      created_at: submittedAt,
    }

    if (!demoResponses.value[surveyId]) {
      demoResponses.value[surveyId] = []
    }
    demoResponses.value[surveyId]?.unshift(newResp)

    if (!demoAnswers.value[surveyId]) {
      demoAnswers.value[surveyId] = []
    }

    for (const [qId, rawVal] of Object.entries(answersMap)) {
      let answer_value: Json = rawVal as Json
      if (typeof rawVal === 'string' || typeof rawVal === 'number' || typeof rawVal === 'boolean') {
        answer_value = rawVal
      } else if (rawVal !== null && rawVal !== undefined) {
        answer_value = JSON.stringify(rawVal)
      }

      const ansRow: AnswerRow = {
        id: `ans-${respId}-${qId}`,
        response_id: respId,
        question_id: qId,
        answer_value,
        iteration_index: 1,
        created_at: submittedAt,
      }
      demoAnswers.value[surveyId]?.push(ansRow)
    }

    return newResp
  }

  return {
    demoSurveys,
    demoSections,
    demoQuestions,
    demoLogicRules,
    demoResponses,
    demoAnswers,
    resetDemoData,
    resetToDefault,
    clearDemoState,
    getSurveys,
    getSurveyById,
    createSurvey,
    updateSurvey: (id: string, updates: Partial<SurveyWithStats>) => {
      const s = demoSurveys.value.find((item) => item.id === id)
      if (s) {
        Object.assign(s, updates)
        return s
      }
      return null
    },
    updateSurveyHeader,
    toggleSurveyStatus,
    deleteSurvey,
    getSections,
    createSection,
    updateSection,
    updateNodePosition,
    deleteSection,
    moveSection,
    getQuestions,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    moveQuestion,
    getLogicRules,
    createLogicRule,
    updateLogicRule,
    deleteLogicRule,
    getResponses,
    getAnswers,
    submitDemoResponse,
  }
}
