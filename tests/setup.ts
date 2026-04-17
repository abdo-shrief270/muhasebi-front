import { vi } from 'vitest'
import { ref, computed, reactive, toRef, toRefs, watch, watchEffect, nextTick } from 'vue'

// Provide Vue's reactivity as globals (Nuxt auto-imports these)
const g = globalThis as any
g.ref = ref
g.computed = computed
g.reactive = reactive
g.toRef = toRef
g.toRefs = toRefs
g.watch = watch
g.watchEffect = watchEffect
g.nextTick = nextTick

// Nuxt-specific composable stubs
g.useState = (key: string, init?: () => any) => ref(init ? init() : undefined)
g.useRuntimeConfig = () => ({
  public: { apiBase: 'http://test', tenantId: '1', primaryColor: '#000', secondaryColor: '#000' },
})
g.useCookie = () => ref('')
g.useI18n = () => ({ locale: ref('en') })
g.navigateTo = vi.fn()
g.defineNuxtRouteMiddleware = vi.fn()
