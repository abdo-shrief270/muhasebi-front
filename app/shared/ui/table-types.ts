// Column + cell-renderer contract for AppTable — see docs/UI_UX_SPEC.md section 11.3.

export type CellValue = string | number | boolean | Date | null | undefined | Record<string, unknown> | unknown[]

export type CellRenderer =
  | 'text'
  | 'money'
  | 'date'
  | 'datetime'
  | 'status'
  | 'badge'
  | 'bool'
  | 'percent'
  | 'entityLink'
  | 'avatar'
  | 'tabular'

export interface ColumnDef<TRow = Record<string, unknown>> {
  // Required: unique column key. Supports dotted paths into the row object.
  key: string
  label: string
  sortable?: boolean
  hideByDefault?: boolean
  width?: number | string
  align?: 'start' | 'end' | 'center'
  render?: CellRenderer
  cellClass?: string
  headerClass?: string
  stickyStart?: boolean
  stickyEnd?: boolean
  excludeFromExport?: boolean
  // Per-renderer options.
  money?: {
    currency?: string   // default: EGP
    signed?: boolean    // show +/- prefix
  }
  status?: {
    kind: string        // e.g. 'invoice' — passed to AppStatusChip
  }
  entity?: {
    // For entityLink cells: fn that returns { label, to }.
    resolve: (row: TRow) => { label: string; to: string }
  }
  bool?: {
    trueLabel?: string
    falseLabel?: string
  }
}
