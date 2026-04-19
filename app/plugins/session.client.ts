export default defineNuxtPlugin({
  name: 'muhasebi:session',
  dependsOn: ['pinia'],
  async setup() {
    const auth = useAuthStore()
    if (!auth.isAuthenticated) return

    const subscription = useSubscription()
    if (!subscription.loaded) {
      await subscription.fetch()
    }
    if (!auth.user) {
      await auth.fetchUser()
    }
  },
})
