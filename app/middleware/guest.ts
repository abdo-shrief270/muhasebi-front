import { defaultRouteFor } from '~/core/auth/guards'

export default defineNuxtRouteMiddleware(() => {
  const auth = useAuthStore()
  if (auth.isAuthenticated) return navigateTo(defaultRouteFor())
})
