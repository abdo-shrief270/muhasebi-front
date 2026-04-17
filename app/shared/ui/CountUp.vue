<template>
  <span ref="el">{{ display }}</span>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  value: string | number
  duration?: number
}>(), {
  duration: 2000,
})

const el = ref<HTMLElement | null>(null)
const display = ref('0')
const hasAnimated = ref(false)

function parseTarget(val: string | number) {
  const str = String(val)
  const match = str.match(/^([^\d]*)([\d,.]+)([^\d]*)$/)
  if (!match) return { prefix: '', num: 0, suffix: str, decimals: 0, original: str }
  const prefix = match[1] || ''
  const numStr = match[2].replace(/,/g, '')
  const suffix = match[3] || ''
  const decimals = numStr.includes('.') ? numStr.split('.')[1].length : 0
  return { prefix, num: parseFloat(numStr), suffix, decimals, original: str }
}

function animate() {
  if (hasAnimated.value) return
  hasAnimated.value = true

  const { prefix, num, suffix, decimals, original } = parseTarget(props.value)
  if (num === 0) { display.value = original; return }

  const start = performance.now()
  function step(now: number) {
    const t = Math.min((now - start) / props.duration, 1)
    const eased = 1 - Math.pow(1 - t, 3)
    const current = eased * num
    display.value = decimals > 0
      ? `${prefix}${current.toFixed(decimals)}${suffix}`
      : `${prefix}${Math.round(current).toLocaleString('en-US')}${suffix}`
    if (t < 1) requestAnimationFrame(step)
    else display.value = original
  }
  requestAnimationFrame(step)
}

onMounted(() => {
  if (!el.value) return
  const obs = new IntersectionObserver(
    ([entry]) => { if (entry.isIntersecting) { animate(); obs.disconnect() } },
    { threshold: 0.3 },
  )
  obs.observe(el.value)
  onUnmounted(() => obs.disconnect())
})
</script>
