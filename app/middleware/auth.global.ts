export default defineNuxtRouteMiddleware((to) => {
  const user = useSupabaseUser()
  const isDemo = to.query.demo === 'true' || to.query.demo === '1'

  // Protect all /admin routes
  if (to.path.startsWith('/admin')) {
    // In demo mode, bypass login requirement
    if (isDemo) {
      return
    }

    if (to.path === '/admin/login') {
      // If already logged in, redirect away from login page to admin dashboard
      if (user.value) {
        return navigateTo('/admin/dashboard')
      }
    } else {
      // If trying to access protected admin pages without active session, redirect to login
      if (!user.value) {
        return navigateTo('/admin/login')
      }
    }
  }
})
