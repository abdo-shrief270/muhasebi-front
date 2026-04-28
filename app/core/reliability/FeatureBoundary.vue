<script setup lang="ts">
import { captureException } from '~/core/telemetry/logger'

const props = defineProps<{
  id: string
  fallback?: string
}>()

const error = ref<Error | null>(null)

onErrorCaptured((err) => {
  error.value = err as Error
  captureException(err, { featureId: props.id, kind: 'feature-boundary' })
  return false
})

function reset() {
  error.value = null
}

function reload() {
  if (import.meta.client) location.reload()
}
</script>

<template>
  <div>
    <template v-if="!error">
      <slot />
    </template>
    <template v-else>
      <slot name="fallback" :error="error" :reset="reset" :reload="reload">
        <div class="flex flex-col items-center justify-center min-h-[40vh] px-6 text-center">
          <div class="w-14 h-14 rounded-full bg-red-50 dark:bg-red-500/15 flex items-center justify-center mb-4">
            <svg class="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
            </svg>
          </div>
          <h2 class="text-lg font-semibold text-neutral-800 dark:text-neutral-100 mb-2">
            {{ fallback || 'Something went wrong' }}
          </h2>
          <p class="text-sm text-neutral-500 dark:text-neutral-400 max-w-md mb-6">
            {{ error.message }}
          </p>
          <div class="flex gap-3">
            <button type="button" @click="reset" class="px-4 py-2 rounded-lg text-sm font-medium border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800">
              Try again
            </button>
            <button type="button" @click="reload" class="px-4 py-2 rounded-lg text-sm font-medium bg-primary-500 text-white hover:bg-primary-600">
              Reload page
            </button>
          </div>
        </div>
      </slot>
    </template>
  </div>
</template>
