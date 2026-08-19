import { vi } from 'vitest'
import { ref, reactive } from 'vue'

const stateMap: Record<string, ReturnType<typeof ref>> = {}

// Universal Nuxt Auto-Imports Stubs for Unit & Component Tests
if (typeof globalThis.useState === 'undefined') {
  vi.stubGlobal('useState', (key: string, init?: () => unknown) => {
    if (!stateMap[key]) {
      stateMap[key] = ref(init ? init() : undefined)
    }
    return stateMap[key]
  })
}

if (typeof globalThis.useRoute === 'undefined') {
  vi.stubGlobal('useRoute', () => ({
    params: { id: 'survey-1' },
    query: {},
    path: '/admin/dashboard',
  }))
}

if (typeof globalThis.useRouter === 'undefined') {
  vi.stubGlobal('useRouter', () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  }))
}

if (typeof globalThis.useSupabaseUser === 'undefined') {
  vi.stubGlobal('useSupabaseUser', () => ref(null))
}

if (typeof globalThis.useSupabaseClient === 'undefined') {
  vi.stubGlobal('useSupabaseClient', () => ({
    auth: {
      signOut: vi.fn().mockResolvedValue({ error: null }),
      signInWithPassword: vi.fn().mockResolvedValue({ data: { user: { id: 'admin-1', email: 'admin@formly.com' } }, error: null }),
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({ data: { id: 'survey-1', title: 'Test Survey' }, error: null }),
          order: () => Promise.resolve({ data: [], error: null }),
        }),
        in: () => ({
          order: () => Promise.resolve({ data: [], error: null }),
        }),
        order: () => Promise.resolve({ data: [], error: null }),
      }),
      insert: (payload: unknown) => ({
        select: () => ({
          single: () => Promise.resolve({ data: { id: 'new-id', ...(payload as Record<string, unknown>) }, error: null }),
        }),
      }),
      update: () => ({
        eq: () => Promise.resolve({ error: null }),
      }),
      delete: () => ({
        eq: () => Promise.resolve({ error: null }),
      }),
    }),
  }))
}

if (typeof globalThis.useToast === 'undefined') {
  vi.stubGlobal('useToast', () => ({
    add: vi.fn(),
  }))
}

if (typeof globalThis.navigateTo === 'undefined') {
  vi.stubGlobal('navigateTo', vi.fn())
}

if (typeof globalThis.definePageMeta === 'undefined') {
  vi.stubGlobal('definePageMeta', vi.fn())
}
