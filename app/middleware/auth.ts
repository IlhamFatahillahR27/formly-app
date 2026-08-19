export default defineNuxtRouteMiddleware((to) => {
  const user = useSupabaseUser()
  const isDemo = to.query.demo === 'true' || to.query.demo === '1'

  if (isDemo) {
    return
  }

  if (!user.value) {
    return navigateTo('/admin/login')
  }
})
