export function useDarkMode() {
  const isDark = useState('dark-mode', () => false)

  function init() {
    if (!import.meta.client) return
    const saved = localStorage.getItem('dark_mode')
    isDark.value = saved === 'true'
    apply()
  }

  function toggle() {
    isDark.value = !isDark.value
    if (import.meta.client) {
      localStorage.setItem('dark_mode', String(isDark.value))
    }
    apply()
  }

  function apply() {
    if (!import.meta.client) return
    document.documentElement.classList.toggle('dark', isDark.value)
  }

  return { isDark, toggle, init }
}
