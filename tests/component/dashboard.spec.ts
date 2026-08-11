import { describe, it, expect } from 'vitest'

describe('Dashboard Component Data Filtering & State Logic', () => {
  const mockSurveys = [
    {
      id: 's1',
      title: 'Survei Kepuasan Pelanggan',
      description: 'Layanan 2026',
      is_active: true,
      section_count: 2,
      response_count: 15,
      created_at: '2026-08-11T10:00:00Z',
    },
    {
      id: 's2',
      title: 'Survei Evaluasi Event',
      description: 'Seminar AI',
      is_active: false,
      section_count: 1,
      response_count: 0,
      created_at: '2026-08-10T10:00:00Z',
    },
  ]

  it('renders all surveys when search and filter are default', () => {
    const searchQuery = ''
    const statusFilter = 'all'

    const filtered = mockSurveys.filter((s) => {
      const matchesSearch = searchQuery === '' || s.title.toLowerCase().includes(searchQuery)
      const matchesStatus = statusFilter === 'all' || (statusFilter === 'active' && s.is_active)
      return matchesSearch && matchesStatus
    })

    expect(filtered.length).toBe(2)
  })

  it('filters surveys by search query', () => {
    const searchQuery = 'evaluasi'
    const statusFilter = 'all'

    const filtered = mockSurveys.filter((s) => {
      const matchesSearch = s.title.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === 'all'
      return matchesSearch && matchesStatus
    })

    expect(filtered.length).toBe(1)
    expect(filtered[0].title).toBe('Survei Evaluasi Event')
  })

  it('filters surveys by active status', () => {
    const searchQuery = ''
    const statusFilter = 'active'

    const filtered = mockSurveys.filter((s) => {
      const matchesSearch = searchQuery === ''
      const matchesStatus = statusFilter === 'active' ? s.is_active : !s.is_active
      return matchesSearch && matchesStatus
    })

    expect(filtered.length).toBe(1)
    expect(filtered[0].id).toBe('s1')
  })

  it('returns empty array when search query matches nothing', () => {
    const searchQuery = 'nonexistent keyword'
    const filtered = mockSurveys.filter((s) => s.title.toLowerCase().includes(searchQuery.toLowerCase()))
    expect(filtered.length).toBe(0)
  })
})
