/**
 * Every permission slug the backend may return on /me.permissions[].
 * Extracted from the module docs under docs/01..28-*.md.
 *
 * Route protection is done server-side via `permission:*` middleware.
 * The frontend only USES these values to hide/show UI.
 */
export const PERMISSIONS = {
  // ---- account & dashboard
  VIEW_DASHBOARD:           'view_dashboard',
  VIEW_AUDIT:               'view_audit',

  // ---- subscription & team & settings
  MANAGE_SUBSCRIPTION:      'manage_subscription',
  MANAGE_TEAM:              'manage_team',
  MANAGE_ONBOARDING:        'manage_onboarding',
  MANAGE_SETTINGS:          'manage_settings',
  MANAGE_LANDING_PAGE:      'manage_landing_page',

  // ---- clients / portal
  MANAGE_CLIENTS:           'manage_clients',
  INVITE_CLIENT_PORTAL:     'invite_client_portal',

  // ---- accounting core
  MANAGE_ACCOUNTS:          'manage_accounts',
  MANAGE_JOURNAL_ENTRIES:   'manage_journal_entries',
  POST_JOURNAL_ENTRIES:     'post_journal_entries',

  // ---- invoicing / collections / payments
  MANAGE_INVOICES:          'manage_invoices',
  SEND_INVOICES:            'send_invoices',
  MANAGE_PAYMENTS:          'manage_payments',
  MANAGE_COLLECTIONS:       'manage_collections',

  // ---- vendors / bills
  MANAGE_VENDORS:           'manage_vendors',
  MANAGE_BILLS:             'manage_bills',

  // ---- expenses / assets / inventory / cost centers
  MANAGE_EXPENSES:          'manage_expenses',
  MANAGE_FIXED_ASSETS:      'manage_fixed_assets',
  MANAGE_INVENTORY:         'manage_inventory',
  MANAGE_COST_CENTERS:      'manage_cost_centers',

  // ---- tax / ETA
  MANAGE_TAX:               'manage_tax',
  MANAGE_ETA:               'manage_eta',

  // ---- payroll / employees
  MANAGE_EMPLOYEES:         'manage_employees',
  MANAGE_PAYROLL:           'manage_payroll',

  // ---- time
  MANAGE_TIMESHEETS:        'manage_timesheets',
  APPROVE_TIMESHEETS:       'approve_timesheets',

  // ---- engagements
  MANAGE_ENGAGEMENTS:       'manage_engagements',

  // ---- reports
  VIEW_REPORTS:             'view_reports',
  MANAGE_REPORTS:           'manage_reports',

  // ---- approvals / alerts
  MANAGE_APPROVALS:         'manage_approvals',
  MANAGE_ALERTS:            'manage_alerts',

  // ---- documents / integrations
  MANAGE_DOCUMENTS:         'manage_documents',
  MANAGE_INTEGRATIONS:      'manage_integrations',
} as const

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS]
