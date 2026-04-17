import { captureException } from '~/core/telemetry/logger'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('vue:error', (err, _instance, info) => {
    captureException(err, { info, kind: 'vue' })
  })

  nuxtApp.hook('app:error', (err) => {
    captureException(err, { kind: 'app' })
  })

  window.addEventListener('unhandledrejection', (e) => {
    captureException(e.reason, { kind: 'unhandledrejection' })
  })

  window.addEventListener('error', (e) => {
    captureException(e.error ?? new Error(e.message), {
      kind: 'window',
      filename: e.filename,
      lineno: e.lineno,
    })
  })
})
