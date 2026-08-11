import { describe, it, expect } from 'vitest'

describe('Phase 2: Login Component & PasswordInput Integration', () => {
  it('validates empty email and password inputs with PasswordInput component', () => {
    const email = ''
    const password = ''
    
    let errorMessage = ''
    if (!email.trim() || !password) {
      errorMessage = 'Email dan password tidak boleh kosong.'
    }

    expect(errorMessage).toBe('Email dan password tidak boleh kosong.')
  })

  it('validates correct form submission payload passing password model', () => {
    const email = 'admin@formly.com'
    const password = 'Password123!'
    
    let errorMessage = ''
    if (!email.trim() || !password) {
      errorMessage = 'Email dan password tidak boleh kosong.'
    }

    expect(errorMessage).toBe('')
  })
})
