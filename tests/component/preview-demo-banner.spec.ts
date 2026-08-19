import { describe, it, expect, vi } from 'vitest'
import { computed } from 'vue'

describe('Preview and Demo Banner Logic Tests', () => {
  it('shows PreviewBanner when preview is true and demo mode is NOT active', () => {
    const route = {
      query: { preview: 'true' },
    }

    const isDemo = computed(() => route?.query?.demo === 'true' || route?.query?.demo === '1')
    const isPreview = computed(() => route?.query?.preview === 'true' || route?.query?.preview === '1')
    const shouldShowPreviewBanner = computed(() => isPreview.value && !isDemo.value)
    const shouldShowDemoBanner = computed(() => isDemo.value)

    expect(shouldShowPreviewBanner.value).toBe(true)
    expect(shouldShowDemoBanner.value).toBe(false)
  })

  it('shows ONLY DemoBanner and hides PreviewBanner when demo mode is active (even if preview is true)', () => {
    const route = {
      query: { demo: 'true', preview: 'true' },
    }

    const isDemo = computed(() => route?.query?.demo === 'true' || route?.query?.demo === '1')
    const isPreview = computed(() => route?.query?.preview === 'true' || route?.query?.preview === '1')
    const shouldShowPreviewBanner = computed(() => isPreview.value && !isDemo.value)
    const shouldShowDemoBanner = computed(() => isDemo.value)

    // PreviewBanner must be suppressed in demo mode
    expect(shouldShowPreviewBanner.value).toBe(false)
    // DemoBanner must be displayed
    expect(shouldShowDemoBanner.value).toBe(true)
  })

  it('shows ONLY DemoBanner when navigating through normal demo pages', () => {
    const route = {
      query: { demo: 'true' },
    }

    const isDemo = computed(() => route?.query?.demo === 'true' || route?.query?.demo === '1')
    const isPreview = computed(() => route?.query?.preview === 'true' || route?.query?.preview === '1')
    const shouldShowPreviewBanner = computed(() => isPreview.value && !isDemo.value)
    const shouldShowDemoBanner = computed(() => isDemo.value)

    expect(shouldShowPreviewBanner.value).toBe(false)
    expect(shouldShowDemoBanner.value).toBe(true)
  })
})
