<template>
  <div>
    <div class="flex items-center gap-1 rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-800">
      <div
        v-for="(hex, stop) in ramp"
        :key="stop"
        class="flex-1 h-9 cursor-pointer transition-transform hover:scale-105 hover:z-10 hover:rounded-md group relative"
        :style="{ backgroundColor: hex }"
        :title="`${stop} · ${hex}`"
        @click="copy(hex)"
      >
        <span
          class="absolute inset-x-0 bottom-0 text-[9px] font-mono text-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"
          :style="{ color: textOn(hex) }"
        >
          {{ stop }}
        </span>
      </div>
    </div>
    <p class="mt-1 text-[10px] text-neutral-400 dark:text-neutral-500 font-mono">
      {{ locale === 'ar' ? 'انقر على لون لنسخه' : 'Click any shade to copy' }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { generateRamp } from '~/core/theme/generateRamp'

const props = defineProps<{
  /** Base hex color — the 500-stop anchor. */
  hex: string
}>()

const { locale } = useI18n()
const toastStore = useToastStore()

const ramp = computed(() => generateRamp(props.hex))

async function copy(hex: string) {
  try {
    await navigator.clipboard.writeText(hex)
    toastStore.success(`${hex} ${locale.value === 'ar' ? 'تم النسخ' : 'copied'}`)
  } catch {
    /* clipboard blocked — silently fail */
  }
}

/** Pick a readable label color (white or near-black) given a swatch background. */
function textOn(hex: string): string {
  const h = hex.replace('#', '')
  const n = parseInt(h, 16)
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255
  const luma = 0.299 * r + 0.587 * g + 0.114 * b
  return luma > 140 ? '#0F172A' : '#FFFFFF'
}
</script>
