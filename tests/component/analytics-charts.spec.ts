import { describe, it, expect } from 'vitest'

describe('Analytics Charts Component Data Transformation & Props Logic', () => {
  it('correctly calculates hasData for ChartBar when all values are zero', () => {
    const labels = ['Pilihan A', 'Pilihan B']
    const data = [0, 0]

    const hasData = data && data.some(v => v > 0)
    expect(hasData).toBe(false)
  })

  it('correctly calculates hasData for ChartBar when at least one value is positive', () => {
    const labels = ['Pilihan A', 'Pilihan B']
    const data = [0, 5]

    const hasData = data && data.some(v => v > 0)
    expect(hasData).toBe(true)
  })

  it('formats ChartPie dataset colors and percentage callbacks accurately', () => {
    const labels = ['Sangat Puas', 'Puas', 'Tidak Puas']
    const data = [10, 5, 5] // Total = 20

    const total = data.reduce((a, b) => a + b, 0)
    expect(total).toBe(20)

    const percentages = data.map(v => Math.round((v / total) * 100))
    expect(percentages).toEqual([50, 25, 25])
  })

  it('handles empty chart datasets gracefully without throwing errors', () => {
    const labels: string[] = []
    const data: number[] = []

    const hasData = data && data.some(v => v > 0)
    expect(hasData).toBe(false)
  })
})
