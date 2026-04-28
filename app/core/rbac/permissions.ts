/**
 * Every permission slug the backend may return on /me.permissions[].
 *
 * As of 2026-04-26, every nav leaf has its own `view_<id>` permission so the
 * sidebar can be gated per leaf rather than per feature group. The legacy
 * `manage_*` slugs are kept — they still gate write actions on the backend
 * (route middleware uses `permission:manage_<feature>`). The new `view_*`
 * slugs only control what shows up in the nav.
 *
 * SuperAdmin bypasses all checks via Gate::before. The frontend uses these
 * values to hide/show UI; backend route guards are independent.
 */
export const PERMISSIONS = {
  // ============================================================
  // VIEW permissions — one per nav leaf for per-link gating.
  // ============================================================

  // ---- dashboard
  VIEW_DASHBOARD:                  'view_dashboard',
  VIEW_NOTIFICATIONS:              'view_notifications',
  VIEW_ACTIVITY_LOG:               'view_activity_log',
  VIEW_AUDIT:                      'view_audit',

  // ---- sales
  VIEW_CLIENTS:                    'view_clients',
  VIEW_INVOICES:                   'view_invoices',
  VIEW_RECURRING_INVOICES:         'view_recurring_invoices',
  VIEW_PAYMENTS:                   'view_payments',
  VIEW_CREDIT_NOTES:               'view_credit_notes',
  VIEW_COLLECTIONS:                'view_collections',

  // ---- purchases
  VIEW_VENDORS:                    'view_vendors',
  VIEW_BILLS:                      'view_bills',
  VIEW_BILL_PAYMENTS:              'view_bill_payments',
  VIEW_EXPENSES:                   'view_expenses',
  VIEW_EXPENSE_REPORTS:            'view_expense_reports',

  // ---- banking
  VIEW_BANK_ACCOUNTS:              'view_bank_accounts',
  VIEW_BANK_RECONCILIATION:        'view_bank_reconciliation',
  VIEW_BANK_CONNECTIONS:           'view_bank_connections',
  VIEW_FX_REVALUATION:             'view_fx_revaluation',

  // ---- accounting
  VIEW_CHART_OF_ACCOUNTS:          'view_chart_of_accounts',
  VIEW_JOURNAL_ENTRIES:            'view_journal_entries',
  VIEW_RECURRING_JOURNAL_ENTRIES:  'view_recurring_journal_entries',
  VIEW_FISCAL_CALENDAR:            'view_fiscal_calendar',
  VIEW_COST_CENTERS:               'view_cost_centers',
  VIEW_BUDGETS:                    'view_budgets',

  // ---- inventory
  VIEW_INVENTORY_PRODUCTS:         'view_inventory_products',
  VIEW_INVENTORY_CATEGORIES:       'view_inventory_categories',
  VIEW_STOCK_MOVEMENTS:            'view_stock_movements',
  VIEW_STOCK_ALERTS:               'view_stock_alerts',

  // ---- fixed assets
  VIEW_FIXED_ASSETS:               'view_fixed_assets',
  VIEW_ASSET_CATEGORIES:           'view_asset_categories',
  VIEW_DEPRECIATION:               'view_depreciation',
  VIEW_ASSET_DISPOSALS:            'view_asset_disposals',

  // ---- tax & compliance
  VIEW_VAT_RETURNS:                'view_vat_returns',
  VIEW_WHT:                        'view_wht',
  VIEW_CORPORATE_TAX:              'view_corporate_tax',
  VIEW_ETA:                        'view_eta',
  VIEW_ETA_ITEM_CODES:             'view_eta_item_codes',

  // ---- payroll & HR
  VIEW_EMPLOYEES:                  'view_employees',
  VIEW_PAYROLL:                    'view_payroll',
  VIEW_PAYSLIPS:                   'view_payslips',
  VIEW_SALARY_COMPONENTS:          'view_salary_components',
  VIEW_LOANS:                      'view_loans',
  VIEW_LEAVE:                      'view_leave',
  VIEW_ATTENDANCE:                 'view_attendance',
  VIEW_SOCIAL_INSURANCE:           'view_social_insurance',

  // ---- services
  VIEW_ENGAGEMENTS:                'view_engagements',
  VIEW_DELIVERABLES:               'view_deliverables',
  VIEW_WORKING_PAPERS:             'view_working_papers',
  VIEW_TIMESHEETS:                 'view_timesheets',
  VIEW_TIMER:                      'view_timer',

  // ---- reports
  VIEW_REPORTS:                    'view_reports',
  VIEW_CUSTOM_REPORTS:             'view_custom_reports',
  VIEW_SCHEDULED_REPORTS:          'view_scheduled_reports',
  VIEW_ANOMALIES:                  'view_anomalies',

  // ---- workflows
  VIEW_APPROVALS:                  'view_approvals',
  VIEW_ALERTS:                     'view_alerts',

  // ---- data & integrations
  VIEW_DOCUMENTS:                  'view_documents',
  VIEW_IMPORT:                     'view_import',
  VIEW_ECOMMERCE:                  'view_ecommerce',
  VIEW_MESSAGING:                  'view_messaging',

  // ---- settings cluster
  VIEW_TEAM:                       'view_team',
  VIEW_ONBOARDING:                 'view_onboarding',
  VIEW_SUBSCRIPTION:               'view_subscription',
  VIEW_COMPANY:                    'view_company',
  VIEW_CURRENCIES:                 'view_currencies',
  VIEW_WEBHOOKS:                   'view_webhooks',
  VIEW_LANDING:                    'view_landing',
  VIEW_SETTINGS:                   'view_settings',

  // ============================================================
  // MANAGE permissions — gate write actions via backend route
  // middleware (`permission:manage_<feature>`). Untouched.
  // ============================================================

  // subscription / team / settings
  MANAGE_SUBSCRIPTION:      'manage_subscription',
  MANAGE_TEAM:              'manage_team',
  MANAGE_ONBOARDING:        'manage_onboarding',
  MANAGE_SETTINGS:          'manage_settings',
  MANAGE_LANDING_PAGE:      'manage_landing_page',

  // clients / portal
  MANAGE_CLIENTS:           'manage_clients',
  INVITE_CLIENT_PORTAL:     'invite_client_portal',

  // accounting core
  MANAGE_ACCOUNTS:          'manage_accounts',
  MANAGE_JOURNAL_ENTRIES:   'manage_journal_entries',
  POST_JOURNAL_ENTRIES:     'post_journal_entries',

  // invoicing / collections / payments
  MANAGE_INVOICES:          'manage_invoices',
  SEND_INVOICES:            'send_invoices',
  MANAGE_PAYMENTS:          'manage_payments',
  MANAGE_COLLECTIONS:       'manage_collections',

  // vendors / bills
  MANAGE_VENDORS:           'manage_vendors',
  MANAGE_BILLS:             'manage_bills',

  // expenses / assets / inventory / cost centers
  MANAGE_EXPENSES:          'manage_expenses',
  MANAGE_FIXED_ASSETS:      'manage_fixed_assets',
  MANAGE_INVENTORY:         'manage_inventory',
  MANAGE_COST_CENTERS:      'manage_cost_centers',

  // tax / ETA
  MANAGE_TAX:               'manage_tax',
  MANAGE_ETA:               'manage_eta',

  // payroll / employees
  MANAGE_EMPLOYEES:         'manage_employees',
  MANAGE_PAYROLL:           'manage_payroll',

  // time
  MANAGE_TIMESHEETS:        'manage_timesheets',
  APPROVE_TIMESHEETS:       'approve_timesheets',

  // documents / integrations
  MANAGE_DOCUMENTS:         'manage_documents',
  MANAGE_INTEGRATIONS:      'manage_integrations',

  // workflow / approvals / engagements / alerts / reports
  MANAGE_APPROVALS:         'manage_approvals',
  MANAGE_ENGAGEMENTS:       'manage_engagements',
  MANAGE_REPORTS:           'manage_reports',
  MANAGE_ALERTS:            'manage_alerts',
} as const

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS]
