/**
 * Shared math for invoice / recurring-invoice line items. Used by the line-
 * editor component (per-row total) and consumer pages (totals card aggregates)
 * so the calculation lives in exactly one place.
 *
 * Rounding: 2 decimal places via Math.round(x*100)/100 — matches what the
 * backend's invoice service does on persistence (BackEnd Money helper, see
 * project_muhasebi_money memory). Don't replace with toFixed() — it returns
 * a string and breaks downstream arithmetic.
 */

/**
 * Editable line shape used by the LineItemsEditor component and the create /
 * edit / recurring pages that compose it. Numbers come from <input
 * type="number"> bound with v-model.number — but Vue still occasionally yields
 * strings (empty input, etc.), hence the union here. The math helpers in this
 * file all coerce defensively.
 */
export interface InvoiceLine {
  /**
   * Optional FK back to the per-client product the line was sourced from.
   * Set when the user picks a product via the editor; null for freeform
   * lines. Snapshot fields (description, unit_price, vat_rate) are still
   * the source of truth at print/post time so renaming or repricing the
   * product later does not rewrite the invoice.
   */
  client_product_id?: number | null
  /**
   * Optional GL revenue account override for this line. Auto-filled from
   * the picked client product's `default_account_id`; null lets the
   * backend fall back to the tenant's default revenue account at GL post
   * time. Persisted as `invoice_lines.account_id` on the backend.
   */
  account_id?: number | null
  description: string
  quantity: number
  unit_price: number
  discount_percent: number
  vat_rate: number
}

export interface InvoiceLineNumeric {
  quantity: number | string
  unit_price: number | string
  discount_percent?: number | string
  vat_rate?: number | string
}

/** Pre-tax line total (qty * price * (1 - disc/100)). */
export function lineSubtotal(line: InvoiceLineNumeric): number {
  const qty = Number(line.quantity) || 0
  const price = Number(line.unit_price) || 0
  const disc = Number(line.discount_percent ?? 0) || 0
  return qty * price * (1 - disc / 100)
}

/** Tax amount on a single line (line subtotal × vat rate). */
export function lineVat(line: InvoiceLineNumeric): number {
  const vat = Number(line.vat_rate ?? 0) || 0
  return lineSubtotal(line) * vat / 100
}

/** Line total including tax, rounded to 2dp. */
export function lineTotal(line: InvoiceLineNumeric): number {
  return Math.round((lineSubtotal(line) + lineVat(line)) * 100) / 100
}

/** Aggregate subtotal across an array of lines (pre-tax). */
export function sumSubtotal(lines: InvoiceLineNumeric[]): number {
  return lines.reduce((s, l) => s + lineSubtotal(l), 0)
}

/** Aggregate VAT across an array of lines. */
export function sumVat(lines: InvoiceLineNumeric[]): number {
  return lines.reduce((s, l) => s + lineVat(l), 0)
}

/** Grand total (subtotal + VAT), rounded to 2dp. */
export function grandTotal(lines: InvoiceLineNumeric[]): number {
  return Math.round((sumSubtotal(lines) + sumVat(lines)) * 100) / 100
}
