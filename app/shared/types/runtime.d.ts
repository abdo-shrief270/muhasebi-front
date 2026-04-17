declare module 'nuxt/schema' {
  interface PublicRuntimeConfig {
    apiBase: string
    tenantId: string
    primaryColor: string
    secondaryColor: string
    sentryDsn: string
    appEnv: 'development' | 'staging' | 'production' | string
  }
}

declare module '#app' {
  interface NuxtApp {
    $isOffline: import('vue').Ref<boolean>
  }
}

export {}
