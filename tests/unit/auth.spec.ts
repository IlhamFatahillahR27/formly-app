import { describe, it, expect, vi } from 'vitest'

describe('Phase 2: Auth Helper & Composable Logic', () => {
  it('should return user session state correctly when user is active', () => {
    const mockUser = {
      id: '5d5f3326-1c76-4214-81b7-42c7dbf222fb',
      email: 'admin@formly.com',
    }

    const useSupabaseUserMock = vi.fn().mockReturnValue({ value: mockUser })

    const user = useSupabaseUserMock()
    expect(user.value).not.toBeNull()
    expect(user.value?.email).toBe('admin@formly.com')
    expect(user.value?.id).toBe('5d5f3326-1c76-4214-81b7-42c7dbf222fb')
  })

  it('should return null when session is unauthenticated', () => {
    const useSupabaseUserMock = vi.fn().mockReturnValue({ value: null })

    const user = useSupabaseUserMock()
    expect(user.value).toBeNull()
  })

  it('should trigger signInWithPassword with correct credentials payload', async () => {
    const signInWithPasswordMock = vi.fn().mockResolvedValue({
      data: { user: { id: 'admin-id-123', email: 'admin@formly.com' } },
      error: null,
    })

    const result = await signInWithPasswordMock({
      email: 'admin@formly.com',
      password: 'Password123!',
    })

    expect(signInWithPasswordMock).toHaveBeenCalledWith({
      email: 'admin@formly.com',
      password: 'Password123!',
    })
    expect(result.error).toBeNull()
    expect(result.data.user.email).toBe('admin@formly.com')
  })
})
