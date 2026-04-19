/**
 * Density accessor + class helpers — §7 of docs/UI_UX_SPEC.md.
 *
 * Components must NOT branch on `layout.name` or `route.path` to pick
 * density. Always go through this composable.
 *
 * Usage in templates:
 *   const { rowHeightClass, inputHeightClass } = useDensity()
 *   <tr :class="rowHeightClass" …>
 */
import { useUiStore, type Density } from '~/stores/ui'

export function useDensity() {
  const ui = useUiStore()

  const density = computed<Density>(() => ui.density)
  const isCompact     = computed(() => density.value === 'compact')
  const isComfortable = computed(() => density.value === 'comfortable')

  /** Table row vertical padding. */
  const rowHeightClass = computed(() =>
    isCompact.value ? 'h-9 py-1.5 leading-snug' : 'h-[52px] py-3 leading-normal',
  )

  /** Input / select height (md size). */
  const inputHeightClass = computed(() =>
    isCompact.value ? 'h-8' : 'h-10',
  )

  /** Button md size — matches input height. */
  const buttonHeightClass = computed(() =>
    isCompact.value ? 'h-8 text-sm' : 'h-10 text-base',
  )

  /** Page-level gutter (left/right padding on layout container). */
  const pageGutterClass = computed(() =>
    isCompact.value ? 'px-3' : 'px-6',
  )

  /** Card inner padding. */
  const cardPaddingClass = computed(() =>
    isCompact.value ? 'p-3' : 'p-5',
  )

  /** Base body text size. */
  const bodyTextClass = computed(() =>
    isCompact.value ? 'text-sm' : 'text-base',
  )

  return {
    density,
    isCompact,
    isComfortable,
    rowHeightClass,
    inputHeightClass,
    buttonHeightClass,
    pageGutterClass,
    cardPaddingClass,
    bodyTextClass,
  }
}
