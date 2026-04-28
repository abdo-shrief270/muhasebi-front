/**
 * Every feature flag the backend may return on tenant.features[].
 * Verified against config/features.php on 2026-04-26.
 *
 * A tenant has access to a module if its slug appears in that array.
 * Frontend uses these to gate features in manifests (feature.ts → flag: ...)
 * and in the staff sidebar (every nav leaf has a `feature`).
 *
 * "Core" features (dashboard, notifications, activity_feed, team_management,
 * onboarding, subscription_management, company_settings, currencies,
 * general_settings) are bundled into every plan including `free_trial` so they
 * are effectively always-on. They appear here for catalog symmetry with the
 * staff nav, not because tenants would realistically disable them.
 */
export const FEATURE_FLAGS = {
  // ---- core platform (always-on)
  DASHBOARD:               'dashboard',
  NOTIFICATIONS:           'notifications',
  ACTIVITY_FEED:           'activity_feed',
  TEAM_MANAGEMENT:         'team_management',
  ONBOARDING:              'onboarding',
  SUBSCRIPTION_MANAGEMENT: 'subscription_management',
  COMPANY_SETTINGS:        'company_settings',
  CURRENCIES:              'currencies',
  GENERAL_SETTINGS:        'general_settings',

  // ---- core modules
  ACCOUNTING:              'accounting',
  CLIENTS:                 'clients',
  DOCUMENTS:               'documents',
  INVOICING:               'invoicing',
  REPORTS:                 'reports',

  // ---- finance
  BANKING:                 'banking',
  BILLS_VENDORS:           'bills_vendors',
  BUDGETING:               'budgeting',
  COLLECTIONS:             'collections',
  COST_CENTERS:            'cost_centers',
  EXPENSES:                'expenses',
  FIXED_ASSETS:            'fixed_assets',
  TAX:                     'tax',

  // ---- operations
  ECOMMERCE:               'ecommerce',
  ENGAGEMENTS:             'engagements',
  INVENTORY:               'inventory',
  PAYROLL:                 'payroll',
  TIMESHEETS:              'timesheets',

  // ---- workflows
  ALERTS:                  'alerts',
  APPROVALS:               'approvals',

  // ---- add-ons / integrations
  API_ACCESS:              'api_access',
  CLIENT_MESSAGING:        'client_messaging',
  CLIENT_PORTAL:           'client_portal',
  CUSTOM_REPORTS:          'custom_reports',
  DATA_IMPORT:             'data_import',
  E_INVOICE:               'e_invoice',
  LANDING_PAGE:            'landing_page',
  WEBHOOKS:                'webhooks',

  // ---- compliance / support
  AUDIT_LOG:               'audit_log',
  PRIORITY_SUPPORT:        'priority_support',
} as const

export type FeatureFlag = typeof FEATURE_FLAGS[keyof typeof FEATURE_FLAGS]
