import { logger } from '~/core/telemetry/logger'

export default defineNuxtPlugin(() => {
  const router = useRouter()
  let startAt = 0

  router.beforeEach(() => {
    startAt = performance.now()
  })

  router.afterEach((to) => {
    const ms = Math.round(performance.now() - startAt)
    logger.info('nav', { path: to.path, ms })
  })
})
