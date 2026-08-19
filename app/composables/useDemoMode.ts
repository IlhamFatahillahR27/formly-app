import { computed } from 'vue'
import type { RouteLocationRaw } from 'vue-router'
import { useDemoState } from '~/composables/useDemoState'

export function useDemoMode() {
  const route = typeof useRoute === 'function' ? useRoute() : null
  const router = typeof useRouter === 'function' ? useRouter() : null
  const demoState = useDemoState()

  const isDemo = computed(() => {
    return route?.query?.demo === 'true' || route?.query?.demo === '1'
  })

  /**
   * Appends or preserves demo query param if currently in demo mode
   */
  function withDemoQuery(target: string | RouteLocationRaw): RouteLocationRaw {
    if (!isDemo.value) return target

    if (typeof target === 'string') {
      const [path, queryStr] = target.split('?')
      const searchParams = new URLSearchParams(queryStr || '')
      searchParams.set('demo', 'true')
      return `${path}?${searchParams.toString()}`
    }

    if (typeof target === 'object' && target !== null) {
      return {
        ...target,
        query: {
          ...(target.query || {}),
          demo: 'true',
        },
      }
    }

    return target
  }

  /**
   * Exits demo mode, clears in-memory state, and redirects to destination
   */
  async function exitDemo(destination = '/') {
    demoState.clearDemoState()
    await router.push(destination)
  }

  return {
    isDemo,
    withDemoQuery,
    exitDemo,
  }
}
