export const PERMISSIONS = {
  VIEW_DASHBOARD: 'view_dashboard',
  MANAGE_CLIENTS: 'manage_clients',
  MANAGE_INVOICES: 'manage_invoices',
  MANAGE_ACCOUNTS: 'manage_accounts',
  POST_JOURNAL_ENTRIES: 'post_journal_entries',
  MANAGE_JOURNAL_ENTRIES: 'manage_journal_entries',
  VIEW_REPORTS: 'view_reports',
  MANAGE_DOCUMENTS: 'manage_documents',
  MANAGE_TEAM: 'manage_team',
  MANAGE_TIMESHEETS: 'manage_timesheets',
  MANAGE_PAYROLL: 'manage_payroll',
  MANAGE_ETA: 'manage_eta',
  MANAGE_SUBSCRIPTION: 'manage_subscription',
  MANAGE_ONBOARDING: 'manage_onboarding',
  MANAGE_SETTINGS: 'manage_settings',
} as const

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS]
