<template>
  <div
    v-if="authStore.isImpersonating && authStore.user"
    role="status"
    class="w-full bg-amber-500 dark:bg-amber-600 text-amber-950 dark:text-amber-50 border-b border-amber-600 dark:border-amber-700"
  >
    <div class="max-w-[1400px] mx-auto px-4 lg:px-6 py-2 flex items-center gap-3 flex-wrap">
      <div class="flex items-center gap-2 min-w-0">
        <UIcon name="i-lucide-user-cog" class="w-4 h-4 flex-shrink-0" />
        <p class="text-sm font-medium truncate">
          <template v-if="locale === 'ar'">
            تتصفح بالنيابة عن <span class="font-bold">{{ authStore.user.name }}</span>
            <span class="opacity-75 text-xs ms-1">({{ authStore.user.email }})</span>
          </template>
          <template v-else>
            Viewing as <span class="font-bold">{{ authStore.user.name }}</span>
            <span class="opacity-75 text-xs ms-1">({{ authStore.user.email }})</span>
          </template>
        </p>
      </div>
      <button
        type="button"
        :disabled="loading"
        @click="endImpersonation"
        class="ms-auto inline-flex items-center gap-1.5 h-7 px-3 rounded-md bg-amber-950/15 hover:bg-amber-950/25 dark:bg-amber-50/15 dark:hover:bg-amber-50/25 text-xs font-semibold transition-colors disabled:opacity-60"
      >
        <UIcon
          :name="loading ? 'i-lucide-loader-2' : 'i-lucide-log-out'"
          :class="['w-3.5 h-3.5', loading && 'animate-spin']"
        />
        {{ locale === 'ar' ? 'إنهاء المحاكاة' : 'End impersonation' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const { locale } = useI18n()
const authStore = useAuthStore()
const loading = ref(false)

async function endImpersonation() {
  if (loading.value) return
  loading.value = true
  try {
    // logout() calls /logout (revokes the current Sanctum token server-side)
    // then clearAuth() locally — which also flips isImpersonating off.
    await authStore.logout()
  } finally {
    loading.value = false
    await navigateTo('/auth/login')
  }
}
</script>
