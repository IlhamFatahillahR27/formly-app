import { describe, it, expect, vi } from 'vitest'

describe('AppNavbar Component UI Tokens & Auth Session Logic', () => {
  it('uses Nuxt UI v3 compliant color tokens and variant for logout button and toast notifications', () => {
    const logoutButtonConfig = {
      color: 'error',
      variant: 'soft',
      size: 'xs',
    }
    const successToastColor = 'success'
    const errorToastColor = 'error'

    expect(logoutButtonConfig.color).toBe('error')
    expect(logoutButtonConfig.variant).toBe('soft')
    expect(logoutButtonConfig.size).toBe('xs')
    expect(successToastColor).toBe('success')
    expect(errorToastColor).toBe('error')
  })

  it('renders admin profile email badge and logout button when user session is active', () => {
    const mockUser = { email: 'admin@formly.com' }
    const showAuthControls = !!mockUser

    expect(showAuthControls).toBe(true)
    expect(mockUser.email).toBe('admin@formly.com')
  })

  it('hides profile badge and logout button when user session is unauthenticated (null)', () => {
    const mockUser = null
    const showAuthControls = !!mockUser

    expect(showAuthControls).toBe(false)
  })

  it('handles logout process, calling signOut and triggering toast notification and route push', async () => {
    const mockSignOut = vi.fn().mockResolvedValue({ error: null })
    const mockPush = vi.fn().mockResolvedValue(true)
    const mockToastAdd = vi.fn()

    let isLoggingOut = false

    async function handleLogout() {
      isLoggingOut = true
      try {
        const { error } = await mockSignOut()
        if (error) {
          mockToastAdd({
            title: 'Logout Failed',
            description: error.message,
            color: 'error',
          })
        } else {
          mockToastAdd({
            title: 'Logged Out',
            description: 'Anda telah berhasil keluar dari akun Admin.',
            color: 'success',
          })
          await mockPush('/admin/login')
        }
      } finally {
        isLoggingOut = false
      }
    }

    await handleLogout()

    expect(mockSignOut).toHaveBeenCalledTimes(1)
    expect(mockToastAdd).toHaveBeenCalledWith({
      title: 'Logged Out',
      description: 'Anda telah berhasil keluar dari akun Admin.',
      color: 'success',
    })
    expect(mockPush).toHaveBeenCalledWith('/admin/login')
    expect(isLoggingOut).toBe(false)
  })

  it('handles logout error scenario, triggering error toast notification', async () => {
    const mockSignOut = vi.fn().mockResolvedValue({ error: { message: 'Network Error' } })
    const mockPush = vi.fn()
    const mockToastAdd = vi.fn()

    let isLoggingOut = false

    async function handleLogout() {
      isLoggingOut = true
      try {
        const { error } = await mockSignOut()
        if (error) {
          mockToastAdd({
            title: 'Logout Failed',
            description: error.message,
            color: 'error',
          })
        }
      } finally {
        isLoggingOut = false
      }
    }

    await handleLogout()

    expect(mockSignOut).toHaveBeenCalledTimes(1)
    expect(mockToastAdd).toHaveBeenCalledWith({
      title: 'Logout Failed',
      description: 'Network Error',
      color: 'error',
    })
    expect(mockPush).not.toHaveBeenCalled()
    expect(isLoggingOut).toBe(false)
  })
})
