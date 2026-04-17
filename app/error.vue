<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center px-6">
    <div
      v-motion
      :initial="{ opacity: 0, scale: 0.95 }"
      :enter="{ opacity: 1, scale: 1 }"
      class="text-center max-w-md"
    >
      <div class="text-8xl mb-6">
        {{ error?.statusCode === 404 ? '🔍' : error?.statusCode === 403 ? '🔒' : '⚠️' }}
      </div>
      <h1 class="text-4xl font-bold text-gray-800 mb-2">{{ error?.statusCode || 500 }}</h1>
      <p class="text-lg text-gray-500 mb-8">
        {{ errorMessage }}
      </p>
      <div class="flex gap-3 justify-center">
        <UiAppButton variant="primary" @click="handleBack">
          {{ locale === 'ar' ? 'العودة' : 'Go Back' }}
        </UiAppButton>
        <UiAppButton variant="outline" @click="clearError({ redirect: '/' })">
          {{ locale === 'ar' ? 'الصفحة الرئيسية' : 'Home' }}
        </UiAppButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { locale } = useI18n()
const error = useError()

const errorMessage = computed(() => {
  const code = error.value?.statusCode
  if (locale.value === 'ar') {
    if (code === 404) return 'الصفحة غير موجودة'
    if (code === 403) return 'ليس لديك صلاحية للوصول'
    return 'حدث خطأ غير متوقع'
  }
  if (code === 404) return 'Page not found'
  if (code === 403) return 'You don\'t have permission to access this page'
  return 'An unexpected error occurred'
})

function handleBack() {
  clearError({ redirect: '/' })
}
</script>
