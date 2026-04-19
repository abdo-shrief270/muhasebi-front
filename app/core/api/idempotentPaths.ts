// URL prefixes whose POST/PUT/PATCH mutate money. The client auto-adds an
// Idempotency-Key header for these so the backend's dedup window catches
// double-submits (spec section 13.2, 1.4).
//
// Match is prefix-based against the URL path (after baseURL is stripped);
// `/invoices` and `/invoices/123/post-to-gl` both match.

const MONEY_MUTATION_PREFIXES: readonly RegExp[] = [
  /^\/?invoices(\/|$)/,
  /^\/?bills(\/|$)/,
  /^\/?payments(\/|$)/,
  /^\/?bill-payments(\/|$)/,
  /^\/?journal-entries(\/|$)/,
  /^\/?recurring-journal-entries(\/|$)/,
  /^\/?payroll(\/|$)/,
  /^\/?credit-notes(\/|$)/,
  /^\/?debit-notes(\/|$)/,
  /^\/?expenses(\/|$)/,
  /^\/?eta\/(submit|cancel|reconcile)/,
  /^\/?subscription\/(upgrade|downgrade|cancel|resume|renew)/,
]

export function isMoneyMutationUrl(url: string): boolean {
  // Strip absolute origins + query strings first so matching stays clean.
  let path = url
  try {
    if (/^https?:\/\//i.test(url)) {
      path = new URL(url).pathname
    }
  } catch {
    // fall through
  }
  path = path.split('?')[0] ?? path
  // Drop a leading /api/v1 or /v1 so routing-relative URLs and absolute ones match the same.
  path = path.replace(/^\/api\/v1/, '').replace(/^\/v1/, '')
  return MONEY_MUTATION_PREFIXES.some(re => re.test(path))
}
