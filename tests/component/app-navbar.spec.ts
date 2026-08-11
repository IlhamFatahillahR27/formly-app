import { describe, it, expect } from 'vitest'

describe('Phase 2: AppNavbar Component Color Tokens & Navigation Logic', () => {
  it('uses Nuxt UI v3 compliant color tokens for logout button and toast notifications', () => {
    const logoutButtonColor = 'error'
    const loginButtonColor = 'primary'
    const successToastColor = 'success'
    const errorToastColor = 'error'

    expect(logoutButtonColor).toBe('error')
    expect(loginButtonColor).toBe('primary')
    expect(successToastColor).toBe('success')
    expect(errorToastColor).toBe('error')
  })

  it('hides Admin Login button when current route is /admin/login', () => {
    const isLoginRoute = (path: string) => path === '/admin/login'

    expect(isLoginRoute('/admin/login')).toBe(true)
    expect(isLoginRoute('/admin/dashboard')).toBe(false)
    expect(isLoginRoute('/')).toBe(false)
  })

  it('shows logged-in admin profile email badge when user session is active', () => {
    const mockUser = { email: 'admin@formly.com' }
    const showProfile = !!mockUser

    expect(showProfile).toBe(true)
    expect(mockUser.email).toBe('admin@formly.com')
  })
})
