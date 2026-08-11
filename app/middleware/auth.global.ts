export default defineNuxtRouteMiddleware((to) => {
  const user = useSupabaseUser()

  // Protect all /admin routes
  if (to.path.startsWith('/admin')) {
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
