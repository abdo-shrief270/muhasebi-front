/**
 * Every feature flag the backend may return on tenant.features[].
 * Verified against config/features.php on 2026-04-19
 * (BACKEND_QUESTIONS 9.2). 23 canonical slugs.
 *
 * A tenant has access to a module if its slug appears in that array.
 * Frontend uses these to gate features in manifests (feature.ts → flag: ...).
 */
export const FEATURE_FLAGS = {
  ACCOUNTING:       'accounting',
  API_ACCESS:       'api_access',
  AUDIT_LOG:        'audit_log',
  BANKING:          'banking',
  BILLS_VENDORS:    'bills_vendors',
  BUDGETING:        'budgeting',
  CLIENTS:          'clients',
  CLIENT_PORTAL:    'client_portal',
  COLLECTIONS:      'collections',
  COST_CENTERS:     'cost_centers',
  CUSTOM_REPORTS:   'custom_reports',
  DOCUMENTS:        'documents',
  E_INVOICE:        'e_invoice',
  ECOMMERCE:        'ecommerce',
  EXPENSES:         'expenses',
  FIXED_ASSETS:     'fixed_assets',
  INVENTORY:        'inventory',
  INVOICING:        'invoicing',
  PAYROLL:          'payroll',
  PRIORITY_SUPPORT: 'priority_support',
  REPORTS:          'reports',
  TAX:              'tax',
  TIMESHEETS:       'timesheets',
} as const

export type FeatureFlag = typeof FEATURE_FLAGS[keyof typeof FEATURE_FLAGS]
