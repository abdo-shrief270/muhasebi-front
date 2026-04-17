export default defineNuxtPlugin(async () => {
  const auth = useAuthStore()
  if (!auth.isAuthenticated) return

  const subscription = useSubscription()
  if (!subscription.loaded) {
    await subscription.fetch()
  }
  if (!auth.user) {
    await auth.fetchUser()
  }
})
