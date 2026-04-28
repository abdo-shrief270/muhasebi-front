<template>
  <div class="rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden bg-neutral-50 dark:bg-neutral-950">
    <div class="flex items-center justify-between px-4 py-2 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-100/60 dark:bg-neutral-900/60">
      <span class="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
        {{ locale === 'ar' ? 'معاينة مباشرة' : 'Live preview' }}
      </span>
      <div class="flex items-center gap-1">
        <button
          v-for="opt in modeOptions"
          :key="opt.value"
          type="button"
          class="text-[11px] px-2 py-1 rounded-md font-medium transition-colors"
          :class="mode === opt.value
            ? 'bg-neutral-0 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-0 shadow-sm'
            : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-200'"
          @click="mode = opt.value"
        >
          {{ opt.label }}
        </button>
      </div>
    </div>

    <div class="grid p-3 gap-3" :class="gridClass">
      <PreviewPane
        v-if="mode !== 'dark-only'"
        scheme="light"
        :branding="branding"
      />
      <PreviewPane
        v-if="mode !== 'light-only'"
        scheme="dark"
        :branding="branding"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Branding } from '~/core/theme/types'

defineProps<{
  branding: Branding
}>()

const { locale } = useI18n()

type Mode = 'split' | 'light-only' | 'dark-only'
const mode = ref<Mode>('split')

const modeOptions = computed<Array<{ value: Mode; label: string }>>(() => [
  { value: 'split',      label: locale.value === 'ar' ? 'الاثنان' : 'Both' },
  { value: 'light-only', label: locale.value === 'ar' ? 'فاتح'    : 'Light' },
  { value: 'dark-only',  label: locale.value === 'ar' ? 'داكن'    : 'Dark' },
])

const gridClass = computed(() => mode.value === 'split' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1')
</script>
