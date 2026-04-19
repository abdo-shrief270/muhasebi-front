/**
 * Canonical status → icon + color mapping — §6.1 of docs/UI_UX_SPEC.md.
 *
 * Every feature that renders a status chip must resolve through this map.
 * Adding a new status? Add it here first — do not inline icons in pages.
 */
export type StatusKind =
  | 'draft'
  | 'pending' | 'submitted'
  | 'approved' | 'posted' | 'paid' | 'valid'
  | 'rejected' | 'failed' | 'void' | 'overdue'
  | 'partial'
  | 'cancelled' | 'archived'
  | 'reversed'
  | 'locked'

export interface StatusVisual {
  icon: string
  /**
   * Nuxt UI semantic color alias. Components pass this to `<UBadge color=…>`
   * and `<UIcon :class="\`text-${color}-500\`">`.
   */
  color: 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'info'
}

export const STATUS_VISUALS: Record<StatusKind, StatusVisual> = {
  draft:     { icon: 'i-lucide-file-text',    color: 'neutral' },

  pending:   { icon: 'i-lucide-clock',        color: 'warning' },
  submitted: { icon: 'i-lucide-clock',        color: 'warning' },

  approved:  { icon: 'i-lucide-check-circle-2', color: 'success' },
  posted:    { icon: 'i-lucide-check-circle-2', color: 'success' },
  paid:      { icon: 'i-lucide-check-circle-2', color: 'success' },
  valid:     { icon: 'i-lucide-check-circle-2', color: 'success' },

  rejected:  { icon: 'i-lucide-x-circle',     color: 'danger' },
  failed:    { icon: 'i-lucide-x-circle',     color: 'danger' },
  void:      { icon: 'i-lucide-x-circle',     color: 'danger' },
  overdue:   { icon: 'i-lucide-x-circle',     color: 'danger' },

  partial:   { icon: 'i-lucide-circle-dashed', color: 'info' },

  cancelled: { icon: 'i-lucide-ban',          color: 'neutral' },
  archived:  { icon: 'i-lucide-ban',          color: 'neutral' },

  reversed:  { icon: 'i-lucide-undo-2',       color: 'neutral' },

  locked:    { icon: 'i-lucide-lock',         color: 'neutral' },
}

/**
 * Resolves a status string to its visual. Unknown statuses default to the
 * neutral "draft" visual rather than throwing — UI should degrade gracefully.
 */
export function resolveStatus(status: string | null | undefined): StatusVisual {
  if (!status) return STATUS_VISUALS.draft
  const key = status.toLowerCase() as StatusKind
  return STATUS_VISUALS[key] ?? STATUS_VISUALS.draft
}
