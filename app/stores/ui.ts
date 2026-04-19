/**
 * UI preferences store — §4 (dark mode), §7 (density), and sidebar state.
 *
 * Persisted to localStorage under `muhasebi:ui`. The UI surfaces (staff vs
 * portal) have different density DEFAULTS but a single source of truth once
 * the user has made a choice.
 */
import { defineStore } from 'pinia'

export type Density = 'compact' | 'comfortable'
export type ColorMode = 'system' | 'light' | 'dark'

const STORAGE_KEY = 'muhasebi:ui'

interface PersistedState {
  density: Density
  colorMode: ColorMode
  sidebarCollapsed: boolean
  useArabicDigits: boolean
}

function loadInitial(): PersistedState {
  const defaults: PersistedState = {
    density: 'compact',
    colorMode: 'system',
    sidebarCollapsed: false,
    useArabicDigits: false,
  }
  if (!import.meta.client) return defaults
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaults
    const parsed = JSON.parse(raw) as Partial<PersistedState>
    return { ...defaults, ...parsed }
  } catch {
    return defaults
  }
}

export const useUiStore = defineStore('ui', () => {
  const initial = loadInitial()

  const density          = ref<Density>(initial.density)
  const colorMode        = ref<ColorMode>(initial.colorMode)
  const sidebarCollapsed = ref<boolean>(initial.sidebarCollapsed)
  const useArabicDigits  = ref<boolean>(initial.useArabicDigits)

  function persist() {
    if (!import.meta.client) return
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        density: density.value,
        colorMode: colorMode.value,
        sidebarCollapsed: sidebarCollapsed.value,
        useArabicDigits: useArabicDigits.value,
      } satisfies PersistedState),
    )
  }

  watch([density, colorMode, sidebarCollapsed, useArabicDigits], persist, { flush: 'post' })

  function setDensity(d: Density)       { density.value = d }
  function setColorMode(m: ColorMode)   { colorMode.value = m }
  function toggleSidebar()               { sidebarCollapsed.value = !sidebarCollapsed.value }
  function setArabicDigits(on: boolean) { useArabicDigits.value = on }

  return {
    density, colorMode, sidebarCollapsed, useArabicDigits,
    setDensity, setColorMode, toggleSidebar, setArabicDigits,
  }
})
