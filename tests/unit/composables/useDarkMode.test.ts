import { describe, it, expect, beforeEach } from 'vitest'
import { useDarkMode } from '~/shared/composables/useDarkMode'

describe('useDarkMode', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.classList.remove('dark')
  })

  it('defaults isDark to false', () => {
    const { isDark } = useDarkMode()
    expect(isDark.value).toBe(false)
  })

  it('toggle switches isDark and persists to localStorage', () => {
    const { isDark, toggle } = useDarkMode()

    toggle()
    expect(isDark.value).toBe(true)
    expect(localStorage.getItem('dark_mode')).toBe('true')

    toggle()
    expect(isDark.value).toBe(false)
    expect(localStorage.getItem('dark_mode')).toBe('false')
  })

  it('toggle adds/removes dark class on documentElement', () => {
    const { toggle } = useDarkMode()

    toggle()
    expect(document.documentElement.classList.contains('dark')).toBe(true)

    toggle()
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  it('init reads dark_mode=true from localStorage', () => {
    localStorage.setItem('dark_mode', 'true')
    const { isDark, init } = useDarkMode()

    init()
    expect(isDark.value).toBe(true)
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('init reads dark_mode=false from localStorage', () => {
    localStorage.setItem('dark_mode', 'false')
    const { isDark, init } = useDarkMode()

    init()
    expect(isDark.value).toBe(false)
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  it('init with no saved value keeps isDark false', () => {
    const { isDark, init } = useDarkMode()

    init()
    expect(isDark.value).toBe(false)
  })
})
