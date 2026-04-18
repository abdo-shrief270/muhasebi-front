/**
 * Every feature flag the backend may return on tenant.features[].
 * A tenant has access to a module if its slug appears in that array.
 *
 * Extracted from the `feature:*` middleware references in docs/01..28-*.md.
 * Frontend uses these to gate features in manifests (feature.ts → flag: ...).
 */
export const FEATURE_FLAGS = {
  ACCOUNTING:      'accounting',
  AUDIT_LOG:       'audit_log',
  BILLS_VENDORS:   'bills_vendors',
  BUDGETING:       'budgeting',
  CLIENTS:         'clients',
  CLIENT_PORTAL:   'client_portal',
  COLLECTIONS:     'collections',
  COST_CENTERS:    'cost_centers',
  CUSTOM_REPORTS:  'custom_reports',
  DOCUMENTS:       'documents',
  E_INVOICE:       'e_invoice',
  EXPENSES:        'expenses',
  FIXED_ASSETS:    'fixed_assets',
  INVENTORY:       'inventory',
  INVOICING:       'invoicing',
  PAYROLL:         'payroll',
  REPORTS:         'reports',
  TAX:             'tax',
  TIMESHEETS:      'timesheets',
} as const

export type FeatureFlag = typeof FEATURE_FLAGS[keyof typeof FEATURE_FLAGS]
