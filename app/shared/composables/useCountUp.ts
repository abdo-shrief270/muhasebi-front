/**
 * Composable for animated number count-up effect.
 * Triggers when element becomes visible via IntersectionObserver.
 */
export function useCountUp(targetValue: number | string, duration = 2000) {
  const displayValue = ref('0')
  const elementRef = ref<HTMLElement | null>(null)
  const hasAnimated = ref(false)

  // Parse the target: extract numeric part and prefix/suffix
  const parsed = computed(() => {
    const str = String(targetValue)
    const match = str.match(/^([^\d]*)([\d,.]+)([^\d]*)$/)
    if (!match) return { prefix: '', number: 0, suffix: str, decimals: 0 }

    const prefix = match[1] || ''
    const numStr = match[2].replace(/,/g, '')
    const suffix = match[3] || ''
    const decimals = numStr.includes('.') ? numStr.split('.')[1].length : 0

    return { prefix, number: parseFloat(numStr), suffix, decimals }
  })

  function animate() {
    if (hasAnimated.value) return
    hasAnimated.value = true

    const { prefix, number, suffix, decimals } = parsed.value
    const startTime = performance.now()

    function step(currentTime: number) {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)

      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = eased * number

      if (decimals > 0) {
        displayValue.value = `${prefix}${current.toFixed(decimals)}${suffix}`
      } else {
        displayValue.value = `${prefix}${Math.round(current).toLocaleString()}${suffix}`
      }

      if (progress < 1) {
        requestAnimationFrame(step)
      } else {
        // Final value exactly as provided
        displayValue.value = String(targetValue)
      }
    }

    requestAnimationFrame(step)
  }

  onMounted(() => {
    if (!elementRef.value) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          animate()
          observer.disconnect()
        }
      },
      { threshold: 0.3 },
    )

    observer.observe(elementRef.value)

    onUnmounted(() => observer.disconnect())
  })

  return { displayValue, elementRef }
}
