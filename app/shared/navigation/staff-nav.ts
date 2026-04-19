// Canonical staff-app sidebar tree — see docs/UI_UX_SPEC.md section 9.1.
//
// Leaves gate on feature flags (tenant.features[]) and permissions (RBAC).
// Empty groups are hidden. Deviation from spec: spec prefixes routes with
// /app; we kept feature pages at root to avoid a 42-feature rename.
export interface NavLeaf {
  id: string
  label: string
  to: string
  icon: string
  feature?: string
  permission?: string
}

export interface NavGroup {
  id: string
  label: string
  items: readonly NavLeaf[]
}

export const STAFF_NAV: readonly NavGroup[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    items: [
      { id: 'home', label: 'nav.home', to: '/dashboard', icon: 'i-lucide-layout-dashboard' },
      { id: 'notifications', label: 'nav.notifications', to: '/notifications', icon: 'i-lucide-bell' },
      { id: 'activity', label: 'nav.activity', to: '/activity-log', icon: 'i-lucide-activity' },
      { id: 'audit', label: 'nav.audit', to: '/audit-log', icon: 'i-lucide-shield-check', feature: 'audit_log' },
    ],
  },
  {
    id: 'sales',
    label: 'Sales',
    items: [
      { id: 'clients', label: 'nav.clients', to: '/clients', icon: 'i-lucide-users', feature: 'clients' },
      { id: 'invoices', label: 'nav.invoices', to: '/invoices', icon: 'i-lucide-file-text', feature: 'invoicing' },
      { id: 'recurring-invoices', label: 'nav.recurring_invoices', to: '/invoices/recurring', icon: 'i-lucide-repeat', feature: 'invoicing' },
      { id: 'payments', label: 'nav.payments_received', to: '/payments', icon: 'i-lucide-wallet', feature: 'invoicing' },
      { id: 'credit-notes', label: 'nav.credit_notes', to: '/credit-notes', icon: 'i-lucide-receipt', feature: 'invoicing' },
      { id: 'collections', label: 'nav.collections', to: '/collections', icon: 'i-lucide-clock-alert', feature: 'collections' },
    ],
  },
  {
    id: 'purchases',
    label: 'Purchases',
    items: [
      { id: 'vendors', label: 'nav.vendors', to: '/vendors', icon: 'i-lucide-truck', feature: 'bills_vendors' },
      { id: 'bills', label: 'nav.bills', to: '/bills', icon: 'i-lucide-file-input', feature: 'bills_vendors' },
      { id: 'bill-payments', label: 'nav.bill_payments', to: '/bill-payments', icon: 'i-lucide-banknote', feature: 'bills_vendors' },
      { id: 'expenses', label: 'nav.expenses', to: '/expenses', icon: 'i-lucide-credit-card', feature: 'expenses' },
      { id: 'expense-reports', label: 'nav.expense_reports', to: '/expense-reports', icon: 'i-lucide-file-spreadsheet', feature: 'expenses' },
    ],
  },
  {
    id: 'banking',
    label: 'Banking',
    items: [
      { id: 'bank-accounts', label: 'nav.bank_accounts', to: '/bank-accounts', icon: 'i-lucide-landmark', feature: 'accounting' },
      { id: 'reconciliation', label: 'nav.reconciliation', to: '/bank-reconciliation', icon: 'i-lucide-git-compare', feature: 'accounting' },
      { id: 'bank-connections', label: 'nav.bank_connections', to: '/bank-connections', icon: 'i-lucide-plug', feature: 'accounting' },
      { id: 'fx-revaluation', label: 'nav.fx_revaluation', to: '/fx-revaluation', icon: 'i-lucide-refresh-cw', feature: 'accounting' },
    ],
  },
  {
    id: 'accounting',
    label: 'Accounting',
    items: [
      { id: 'coa', label: 'nav.chart_of_accounts', to: '/accounts', icon: 'i-lucide-list-tree', feature: 'accounting' },
      { id: 'journal-entries', label: 'nav.journal_entries', to: '/journal-entries', icon: 'i-lucide-book-open', feature: 'accounting' },
      { id: 'recurring-je', label: 'nav.recurring_je', to: '/journal-entries/recurring', icon: 'i-lucide-repeat', feature: 'accounting' },
      { id: 'fiscal-calendar', label: 'nav.fiscal_calendar', to: '/fiscal-calendar', icon: 'i-lucide-calendar-days', feature: 'accounting' },
      { id: 'cost-centers', label: 'nav.cost_centers', to: '/cost-centers', icon: 'i-lucide-layers', feature: 'cost_centers' },
      { id: 'budgets', label: 'nav.budgets', to: '/budgets', icon: 'i-lucide-target', feature: 'budgeting' },
    ],
  },
  {
    id: 'inventory',
    label: 'Inventory',
    items: [
      { id: 'products', label: 'nav.products', to: '/inventory', icon: 'i-lucide-package', feature: 'inventory' },
      { id: 'product-categories', label: 'nav.product_categories', to: '/inventory/categories', icon: 'i-lucide-folder-tree', feature: 'inventory' },
      { id: 'stock-movements', label: 'nav.stock_movements', to: '/inventory/movements', icon: 'i-lucide-arrow-left-right', feature: 'inventory' },
      { id: 'stock-alerts', label: 'nav.stock_alerts', to: '/inventory/alerts', icon: 'i-lucide-alert-triangle', feature: 'inventory' },
    ],
  },
  {
    id: 'fixed_assets',
    label: 'Fixed Assets',
    items: [
      { id: 'assets', label: 'nav.asset_register', to: '/fixed-assets', icon: 'i-lucide-box', feature: 'fixed_assets' },
      { id: 'asset-categories', label: 'nav.asset_categories', to: '/fixed-assets/categories', icon: 'i-lucide-folder', feature: 'fixed_assets' },
      { id: 'depreciation', label: 'nav.depreciation', to: '/fixed-assets/depreciation', icon: 'i-lucide-trending-down', feature: 'fixed_assets' },
      { id: 'disposals', label: 'nav.disposals', to: '/fixed-assets/disposals', icon: 'i-lucide-trash-2', feature: 'fixed_assets' },
    ],
  },
  {
    id: 'tax',
    label: 'Tax & Compliance',
    items: [
      { id: 'vat', label: 'nav.vat_returns', to: '/tax/vat', icon: 'i-lucide-percent', feature: 'tax' },
      { id: 'wht', label: 'nav.wht', to: '/tax/wht', icon: 'i-lucide-receipt-text', feature: 'tax' },
      { id: 'corporate-tax', label: 'nav.corporate_tax', to: '/tax/corporate', icon: 'i-lucide-building-2', feature: 'tax' },
      { id: 'eta', label: 'nav.eta_einvoicing', to: '/eta', icon: 'i-lucide-scan-line', feature: 'e_invoice' },
      { id: 'eta-item-codes', label: 'nav.eta_item_codes', to: '/eta/item-codes', icon: 'i-lucide-barcode', feature: 'e_invoice' },
    ],
  },
  {
    id: 'payroll_hr',
    label: 'Payroll & HR',
    items: [
      { id: 'employees', label: 'nav.employees', to: '/payroll/employees', icon: 'i-lucide-users-round', feature: 'payroll' },
      { id: 'payroll-runs', label: 'nav.payroll_runs', to: '/payroll', icon: 'i-lucide-calendar-clock', feature: 'payroll' },
      { id: 'payslips', label: 'nav.payslips', to: '/payroll/payslips', icon: 'i-lucide-file-text', feature: 'payroll' },
      { id: 'salary-components', label: 'nav.salary_components', to: '/payroll/components', icon: 'i-lucide-sliders', feature: 'payroll' },
      { id: 'loans', label: 'nav.loans', to: '/payroll/loans', icon: 'i-lucide-hand-coins', feature: 'payroll' },
      { id: 'leave', label: 'nav.leave', to: '/payroll/leave', icon: 'i-lucide-plane', feature: 'payroll' },
      { id: 'attendance', label: 'nav.attendance', to: '/payroll/attendance', icon: 'i-lucide-clock', feature: 'payroll' },
      { id: 'social-insurance', label: 'nav.social_insurance', to: '/payroll/social-insurance', icon: 'i-lucide-shield', feature: 'payroll' },
    ],
  },
  {
    id: 'services',
    label: 'Services',
    items: [
      { id: 'engagements', label: 'nav.engagements', to: '/engagements', icon: 'i-lucide-briefcase' },
      { id: 'deliverables', label: 'nav.deliverables', to: '/engagements/deliverables', icon: 'i-lucide-check-circle' },
      { id: 'working-papers', label: 'nav.working_papers', to: '/engagements/working-papers', icon: 'i-lucide-file-stack' },
      { id: 'timesheets', label: 'nav.timesheets', to: '/timesheets', icon: 'i-lucide-clock-4', feature: 'timesheets' },
      { id: 'timer', label: 'nav.timer', to: '/timesheets/timer', icon: 'i-lucide-timer', feature: 'timesheets' },
    ],
  },
  {
    id: 'reports',
    label: 'Reports',
    items: [
      { id: 'report-center', label: 'nav.report_center', to: '/reports', icon: 'i-lucide-bar-chart-3', feature: 'reports' },
      { id: 'custom-reports', label: 'nav.custom_reports', to: '/custom-reports', icon: 'i-lucide-sliders-horizontal', feature: 'custom_reports' },
      { id: 'scheduled-reports', label: 'nav.scheduled_reports', to: '/reports/scheduled', icon: 'i-lucide-calendar-clock', feature: 'reports' },
      { id: 'anomalies', label: 'nav.anomalies', to: '/anomalies', icon: 'i-lucide-alert-octagon' },
    ],
  },
  {
    id: 'workflows',
    label: 'Workflows',
    items: [
      { id: 'approvals', label: 'nav.approvals', to: '/approvals', icon: 'i-lucide-check-check' },
      { id: 'alerts', label: 'nav.alerts', to: '/alerts', icon: 'i-lucide-bell-ring' },
    ],
  },
  {
    id: 'data',
    label: 'Data',
    items: [
      { id: 'documents', label: 'nav.documents', to: '/documents', icon: 'i-lucide-files', feature: 'documents' },
      { id: 'import', label: 'nav.data_import', to: '/import', icon: 'i-lucide-upload' },
      { id: 'ecommerce', label: 'nav.ecommerce', to: '/ecommerce', icon: 'i-lucide-shopping-cart' },
      { id: 'messaging', label: 'nav.messaging', to: '/messaging', icon: 'i-lucide-message-square' },
    ],
  },
  {
    id: 'settings',
    label: 'Settings',
    items: [
      { id: 'team', label: 'nav.team', to: '/team', icon: 'i-lucide-user-cog' },
      { id: 'onboarding', label: 'nav.onboarding', to: '/onboarding', icon: 'i-lucide-rocket' },
      { id: 'subscription', label: 'nav.subscription', to: '/subscription', icon: 'i-lucide-credit-card' },
      { id: 'company', label: 'nav.company', to: '/settings/company', icon: 'i-lucide-building' },
      { id: 'currencies', label: 'nav.currencies', to: '/currency', icon: 'i-lucide-coins' },
      { id: 'webhooks', label: 'nav.webhooks', to: '/webhooks', icon: 'i-lucide-webhook' },
      { id: 'landing', label: 'nav.landing', to: '/settings/landing', icon: 'i-lucide-layout' },
      { id: 'general', label: 'nav.general', to: '/settings', icon: 'i-lucide-settings' },
    ],
  },
]

export const PORTAL_NAV: readonly NavLeaf[] = [
  { id: 'overview', label: 'portal.nav.overview', to: '/portal', icon: 'i-lucide-home' },
  { id: 'invoices', label: 'portal.nav.invoices', to: '/portal/invoices', icon: 'i-lucide-file-text' },
  { id: 'documents', label: 'portal.nav.documents', to: '/portal/documents', icon: 'i-lucide-files' },
  { id: 'messages', label: 'portal.nav.messages', to: '/portal/messages', icon: 'i-lucide-message-square' },
  { id: 'profile', label: 'portal.nav.profile', to: '/portal/profile', icon: 'i-lucide-user' },
]
