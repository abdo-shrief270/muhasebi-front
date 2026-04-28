// Canonical staff-app sidebar tree — see docs/UI_UX_SPEC.md section 9.1.
//
// Each leaf carries a UNIQUE `permission` slug (see `core/rbac/permissions.ts`)
// so admins can selectively grant access to one sub-feature without granting
// the whole group. The `feature` flag (plan-level subscription gate) is still
// independent: a leaf is shown only when BOTH the tenant's plan includes the
// feature AND the user has the per-leaf permission.
//
// Permission naming convention: `view_<leaf_id>` where the id is converted
// from kebab-case to snake_case (e.g. `recurring-invoices` → `view_recurring_invoices`).
// The matching role-default mapping lives in `config/permissions.php` on the
// backend.
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
      { id: 'home',          label: 'nav.home',          to: '/dashboard',     icon: 'i-lucide-layout-dashboard',  feature: 'dashboard',     permission: 'view_dashboard' },
      { id: 'notifications', label: 'nav.notifications', to: '/notifications', icon: 'i-lucide-bell',              feature: 'notifications', permission: 'view_notifications' },
      { id: 'activity',      label: 'nav.activity',      to: '/activity-log',  icon: 'i-lucide-activity',          feature: 'activity_feed', permission: 'view_activity_log' },
      { id: 'audit',         label: 'nav.audit',         to: '/audit-log',     icon: 'i-lucide-shield-check',      feature: 'audit_log',     permission: 'view_audit' },
    ],
  },
  {
    id: 'sales',
    label: 'Sales',
    items: [
      { id: 'clients',            label: 'nav.clients',            to: '/clients',            icon: 'i-lucide-users',       feature: 'clients',     permission: 'view_clients' },
      { id: 'catalog',            label: 'nav.catalog',            to: '/catalog',            icon: 'i-lucide-package',     feature: 'clients',     permission: 'view_clients' },
      { id: 'invoices',           label: 'nav.invoices',           to: '/invoices',           icon: 'i-lucide-file-text',   feature: 'invoicing',   permission: 'view_invoices' },
      { id: 'recurring-invoices', label: 'nav.recurring_invoices', to: '/invoices/recurring', icon: 'i-lucide-repeat',      feature: 'invoicing',   permission: 'view_recurring_invoices' },
      { id: 'payments',           label: 'nav.payments_received',  to: '/payments',           icon: 'i-lucide-wallet',      feature: 'invoicing',   permission: 'view_payments' },
      { id: 'credit-notes',       label: 'nav.credit_notes',       to: '/credit-notes',       icon: 'i-lucide-receipt',     feature: 'invoicing',   permission: 'view_credit_notes' },
      { id: 'collections',        label: 'nav.collections',        to: '/collections',        icon: 'i-lucide-clock-alert', feature: 'collections', permission: 'view_collections' },
    ],
  },
  {
    id: 'purchases',
    label: 'Purchases',
    items: [
      { id: 'vendors',          label: 'nav.vendors',          to: '/vendors',          icon: 'i-lucide-truck',           feature: 'bills_vendors', permission: 'view_vendors' },
      { id: 'bills',            label: 'nav.bills',            to: '/bills',            icon: 'i-lucide-file-input',      feature: 'bills_vendors', permission: 'view_bills' },
      { id: 'bill-payments',    label: 'nav.bill_payments',    to: '/bill-payments',    icon: 'i-lucide-banknote',        feature: 'bills_vendors', permission: 'view_bill_payments' },
      { id: 'expenses',         label: 'nav.expenses',         to: '/expenses',         icon: 'i-lucide-credit-card',     feature: 'expenses',      permission: 'view_expenses' },
      { id: 'expense-reports',  label: 'nav.expense_reports',  to: '/expense-reports',  icon: 'i-lucide-file-spreadsheet', feature: 'expenses',     permission: 'view_expense_reports' },
    ],
  },
  {
    id: 'banking',
    label: 'Banking',
    items: [
      { id: 'bank-accounts',    label: 'nav.bank_accounts',    to: '/bank-accounts',       icon: 'i-lucide-landmark',     feature: 'banking', permission: 'view_bank_accounts' },
      { id: 'reconciliation',   label: 'nav.reconciliation',   to: '/bank-reconciliation', icon: 'i-lucide-git-compare',  feature: 'banking', permission: 'view_bank_reconciliation' },
      { id: 'bank-connections', label: 'nav.bank_connections', to: '/bank-connections',    icon: 'i-lucide-plug',         feature: 'banking', permission: 'view_bank_connections' },
      { id: 'fx-revaluation',   label: 'nav.fx_revaluation',   to: '/fx-revaluation',      icon: 'i-lucide-refresh-cw',   feature: 'banking', permission: 'view_fx_revaluation' },
    ],
  },
  {
    id: 'accounting',
    label: 'Accounting',
    items: [
      { id: 'coa',              label: 'nav.chart_of_accounts', to: '/accounts',              icon: 'i-lucide-list-tree',     feature: 'accounting',    permission: 'view_chart_of_accounts' },
      { id: 'journal-entries',  label: 'nav.journal_entries',   to: '/journal-entries',       icon: 'i-lucide-book-open',     feature: 'accounting',    permission: 'view_journal_entries' },
      { id: 'recurring-je',     label: 'nav.recurring_je',      to: '/journal-entries/recurring', icon: 'i-lucide-repeat',    feature: 'accounting',    permission: 'view_recurring_journal_entries' },
      { id: 'fiscal-calendar',  label: 'nav.fiscal_calendar',   to: '/fiscal-calendar',       icon: 'i-lucide-calendar-days', feature: 'accounting',    permission: 'view_fiscal_calendar' },
      { id: 'cost-centers',     label: 'nav.cost_centers',      to: '/cost-centers',          icon: 'i-lucide-layers',        feature: 'cost_centers',  permission: 'view_cost_centers' },
      { id: 'budgets',          label: 'nav.budgets',           to: '/budgets',               icon: 'i-lucide-target',        feature: 'budgeting',     permission: 'view_budgets' },
    ],
  },
  {
    id: 'inventory',
    label: 'Inventory',
    items: [
      { id: 'products',           label: 'nav.products',           to: '/inventory',            icon: 'i-lucide-package',         feature: 'inventory', permission: 'view_inventory_products' },
      { id: 'product-categories', label: 'nav.product_categories', to: '/inventory/categories', icon: 'i-lucide-folder-tree',     feature: 'inventory', permission: 'view_inventory_categories' },
      { id: 'stock-movements',    label: 'nav.stock_movements',    to: '/inventory/movements',  icon: 'i-lucide-arrow-left-right', feature: 'inventory', permission: 'view_stock_movements' },
      { id: 'stock-alerts',       label: 'nav.stock_alerts',       to: '/inventory/alerts',     icon: 'i-lucide-alert-triangle',  feature: 'inventory', permission: 'view_stock_alerts' },
    ],
  },
  {
    id: 'fixed_assets',
    label: 'Fixed Assets',
    items: [
      { id: 'assets',           label: 'nav.asset_register',  to: '/fixed-assets',              icon: 'i-lucide-box',          feature: 'fixed_assets', permission: 'view_fixed_assets' },
      { id: 'asset-categories', label: 'nav.asset_categories', to: '/fixed-assets/categories', icon: 'i-lucide-folder',       feature: 'fixed_assets', permission: 'view_asset_categories' },
      { id: 'depreciation',     label: 'nav.depreciation',    to: '/fixed-assets/depreciation', icon: 'i-lucide-trending-down', feature: 'fixed_assets', permission: 'view_depreciation' },
      { id: 'disposals',        label: 'nav.disposals',       to: '/fixed-assets/disposals',  icon: 'i-lucide-trash-2',      feature: 'fixed_assets', permission: 'view_asset_disposals' },
    ],
  },
  {
    id: 'tax',
    label: 'Tax & Compliance',
    items: [
      { id: 'vat',             label: 'nav.vat_returns',    to: '/tax/vat',         icon: 'i-lucide-percent',      feature: 'tax',       permission: 'view_vat_returns' },
      { id: 'wht',             label: 'nav.wht',            to: '/tax/wht',         icon: 'i-lucide-receipt-text', feature: 'tax',       permission: 'view_wht' },
      { id: 'corporate-tax',   label: 'nav.corporate_tax',  to: '/tax/corporate',   icon: 'i-lucide-building-2',   feature: 'tax',       permission: 'view_corporate_tax' },
      { id: 'eta',             label: 'nav.eta_einvoicing', to: '/eta',             icon: 'i-lucide-scan-line',    feature: 'e_invoice', permission: 'view_eta' },
      { id: 'eta-item-codes',  label: 'nav.eta_item_codes', to: '/eta/item-codes',  icon: 'i-lucide-barcode',      feature: 'e_invoice', permission: 'view_eta_item_codes' },
    ],
  },
  {
    id: 'payroll_hr',
    label: 'Payroll & HR',
    items: [
      { id: 'employees',          label: 'nav.employees',          to: '/payroll/employees',         icon: 'i-lucide-users-round',     feature: 'payroll', permission: 'view_employees' },
      { id: 'payroll-runs',       label: 'nav.payroll_runs',       to: '/payroll',                    icon: 'i-lucide-calendar-clock', feature: 'payroll', permission: 'view_payroll' },
      { id: 'payslips',           label: 'nav.payslips',           to: '/payroll/payslips',           icon: 'i-lucide-file-text',     feature: 'payroll', permission: 'view_payslips' },
      { id: 'salary-components',  label: 'nav.salary_components',  to: '/payroll/components',         icon: 'i-lucide-sliders',       feature: 'payroll', permission: 'view_salary_components' },
      { id: 'loans',              label: 'nav.loans',              to: '/payroll/loans',              icon: 'i-lucide-hand-coins',    feature: 'payroll', permission: 'view_loans' },
      { id: 'leave',              label: 'nav.leave',              to: '/payroll/leave',              icon: 'i-lucide-plane',         feature: 'payroll', permission: 'view_leave' },
      { id: 'attendance',         label: 'nav.attendance',         to: '/payroll/attendance',         icon: 'i-lucide-clock',         feature: 'payroll', permission: 'view_attendance' },
      { id: 'social-insurance',   label: 'nav.social_insurance',   to: '/payroll/social-insurance',   icon: 'i-lucide-shield',        feature: 'payroll', permission: 'view_social_insurance' },
    ],
  },
  {
    id: 'services',
    label: 'Services',
    items: [
      { id: 'engagements',     label: 'nav.engagements',    to: '/engagements',                 icon: 'i-lucide-briefcase',      feature: 'engagements', permission: 'view_engagements' },
      { id: 'deliverables',    label: 'nav.deliverables',   to: '/engagements/deliverables',    icon: 'i-lucide-check-circle',   feature: 'engagements', permission: 'view_deliverables' },
      { id: 'working-papers',  label: 'nav.working_papers', to: '/engagements/working-papers',  icon: 'i-lucide-file-stack',     feature: 'engagements', permission: 'view_working_papers' },
      { id: 'timesheets',      label: 'nav.timesheets',     to: '/timesheets',                  icon: 'i-lucide-clock-4',        feature: 'timesheets', permission: 'view_timesheets' },
      { id: 'timer',           label: 'nav.timer',          to: '/timesheets/timer',            icon: 'i-lucide-timer',          feature: 'timesheets', permission: 'view_timer' },
    ],
  },
  {
    id: 'reports',
    label: 'Reports',
    items: [
      { id: 'report-center',     label: 'nav.report_center',     to: '/reports',           icon: 'i-lucide-bar-chart-3',         feature: 'reports',         permission: 'view_reports' },
      { id: 'custom-reports',    label: 'nav.custom_reports',    to: '/custom-reports',    icon: 'i-lucide-sliders-horizontal',  feature: 'custom_reports',  permission: 'view_custom_reports' },
      { id: 'scheduled-reports', label: 'nav.scheduled_reports', to: '/reports/scheduled', icon: 'i-lucide-calendar-clock',      feature: 'reports',         permission: 'view_scheduled_reports' },
      { id: 'anomalies',         label: 'nav.anomalies',         to: '/anomalies',         icon: 'i-lucide-alert-octagon',       feature: 'reports',         permission: 'view_anomalies' },
    ],
  },
  {
    id: 'workflows',
    label: 'Workflows',
    items: [
      { id: 'approvals', label: 'nav.approvals', to: '/approvals', icon: 'i-lucide-check-check', feature: 'approvals', permission: 'view_approvals' },
      { id: 'alerts',    label: 'nav.alerts',    to: '/alerts',    icon: 'i-lucide-bell-ring',   feature: 'alerts',    permission: 'view_alerts' },
    ],
  },
  {
    id: 'data',
    label: 'Data',
    items: [
      { id: 'documents', label: 'nav.documents',    to: '/documents', icon: 'i-lucide-files',          feature: 'documents',         permission: 'view_documents' },
      { id: 'import',    label: 'nav.data_import',  to: '/import',    icon: 'i-lucide-upload',         feature: 'data_import',       permission: 'view_import' },
      { id: 'ecommerce', label: 'nav.ecommerce',    to: '/ecommerce', icon: 'i-lucide-shopping-cart',  feature: 'ecommerce',         permission: 'view_ecommerce' },
      { id: 'messaging', label: 'nav.messaging',    to: '/messaging', icon: 'i-lucide-message-square', feature: 'client_messaging',  permission: 'view_messaging' },
    ],
  },
  {
    id: 'settings',
    label: 'Settings',
    items: [
      { id: 'team',         label: 'nav.team',         to: '/team',             icon: 'i-lucide-user-cog',     feature: 'team_management',         permission: 'view_team' },
      { id: 'onboarding',   label: 'nav.onboarding',   to: '/onboarding',       icon: 'i-lucide-rocket',       feature: 'onboarding',              permission: 'view_onboarding' },
      { id: 'subscription', label: 'nav.subscription', to: '/subscription',     icon: 'i-lucide-credit-card',  feature: 'subscription_management', permission: 'view_subscription' },
      { id: 'company',      label: 'nav.company',      to: '/settings/company', icon: 'i-lucide-building',     feature: 'company_settings',        permission: 'view_company' },
      { id: 'currencies',   label: 'nav.currencies',   to: '/currency',         icon: 'i-lucide-coins',        feature: 'currencies',              permission: 'view_currencies' },
      { id: 'webhooks',     label: 'nav.webhooks',     to: '/webhooks',         icon: 'i-lucide-webhook',      feature: 'webhooks',                permission: 'view_webhooks' },
      { id: 'landing',      label: 'nav.landing',      to: '/settings/landing', icon: 'i-lucide-layout',       feature: 'landing_page',            permission: 'view_landing' },
      { id: 'general',      label: 'nav.general',      to: '/settings',         icon: 'i-lucide-settings',     feature: 'general_settings',        permission: 'view_settings' },
    ],
  },
]

export const PORTAL_NAV: readonly NavLeaf[] = [
  { id: 'overview',  label: 'portal.nav.overview',  to: '/portal',           icon: 'i-lucide-home' },
  { id: 'invoices',  label: 'portal.nav.invoices',  to: '/portal/invoices',  icon: 'i-lucide-file-text' },
  { id: 'documents', label: 'portal.nav.documents', to: '/portal/documents', icon: 'i-lucide-files' },
  { id: 'messages',  label: 'portal.nav.messages',  to: '/portal/messages',  icon: 'i-lucide-message-square' },
  { id: 'profile',   label: 'portal.nav.profile',   to: '/portal/profile',   icon: 'i-lucide-user' },
]
