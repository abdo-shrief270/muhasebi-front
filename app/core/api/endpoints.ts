/**
 * Canonical registry of every API path the frontend calls.
 * Generated from docs/01..28-*.md. Keep in sync as docs evolve.
 *
 * Rules:
 *   - Static paths are strings; parameterized paths are functions of the url param.
 *   - Group by feature. Inbound webhooks (payment gateways) are NOT listed — the
 *     backend receives them, frontend never calls.
 *   - Services import ENDPOINTS and use the entries. No inline strings.
 */

type Id = number | string

export const ENDPOINTS = {
  /* ------------------------------------------------------------- 01 auth */
  auth: {
    register:               '/register',
    login:                  '/login',
    logout:                 '/logout',
    me:                     '/me',
    profile:                '/profile',
    changePassword:         '/change-password',
    twoFactor: {
      status:  '/2fa/status',
      enable:  '/2fa/enable',
      verify:  '/2fa/verify',
      disable: '/2fa/disable',
    },
    notificationPreferences: '/notification-preferences',
    preferences: {
      root:      '/preferences',
      reset:     '/preferences/reset',
      shortcuts: '/preferences/shortcuts',
    },
    deviceTokens: '/device-tokens',
  },

  /* -------------------------------------------------- 02 public routes */
  public: {
    plans:          '/plans',
    plan:           (planId: Id) => `/plans/${planId}`,
    addOns:         '/add-ons',
    landing:        '/landing',
    featureShowcase:'/landing/feature-showcase',
    page:           (slug: string) => `/pages/${slug}`,
    contact:        '/contact',
    health:         '/health',
    docs:           '/docs',
    docsSpec:       '/docs/spec',
    blog: {
      list:       '/blog',
      featured:   '/blog/featured',
      categories: '/blog/categories',
      tags:       '/blog/tags',
      search:     '/blog/search',
      post:       (slug: string) => `/blog/${slug}`,
      rss:        '/blog/rss',
    },
  },

  /* ------------------------------------ 03 dashboard, activity, notifications */
  dashboard: {
    root: '/dashboard',
    // Extended dashboard (module 19) lives under reports.dashboard
  },

  activityLog: {
    list:  '/activity-log',
    stats: '/activity-log/stats',
    one:   (id: Id) => `/activity-log/${id}`,
  },

  auditCompliance: {
    userAccess:  '/audit-compliance/user-access',
    changes:     '/audit-compliance/changes',
    highRisk:    '/audit-compliance/high-risk',
    segregation: '/audit-compliance/segregation',
    export:      '/audit-compliance/export',
    summary:     '/audit-compliance/summary',
  },

  notifications: {
    list:        '/notifications',
    unreadCount: '/notifications/unread-count',
    read:        (id: Id) => `/notifications/${id}/read`,
    readAll:     '/notifications/read-all',
    remove:      (id: Id) => `/notifications/${id}`,
  },

  /* ----------------------------------------------- 04 subscription & plans */
  subscription: {
    current:      '/subscription',
    subscribe:    '/subscription/subscribe',
    changePlan:   '/subscription/change-plan',
    renew:        '/subscription/renew',
    cancel:       '/subscription/cancel',
    usage:        '/subscription/usage',
    usageHistory: '/subscription/usage-history',
    payments:     '/subscription/payments',
    addOns:       '/subscription/add-ons',
    addOn:        (id: Id) => `/subscription/add-ons/${id}`,
    credits:      '/subscription/credits',
  },

  /* ----------------------------------------------------------- 05 clients */
  clients: {
    list:         '/clients',
    one:          (id: Id) => `/clients/${id}`,
    restore:      (id: Id) => `/clients/${id}/restore`,
    toggleActive: (id: Id) => `/clients/${id}/toggle-active`,
    messages:     (id: Id) => `/clients/${id}/messages`,
    invitePortal: (id: Id) => `/clients/${id}/invite-portal`,
    portalUsers: (id: Id) => `/clients/${id}/portal-users`,
    portalUserRevoke: (clientId: Id, userId: Id) => `/clients/${clientId}/portal-users/${userId}`,
    portalUserResend: (clientId: Id, userId: Id) => `/clients/${clientId}/portal-users/${userId}/resend-invite`,
    products:     (id: Id) => `/clients/${id}/products`,
    productsOne:  (clientId: Id, productId: Id) => `/clients/${clientId}/products/${productId}`,
  },

  bankAccounts: {
    list: '/bank-accounts',
    one:  (id: Id) => `/bank-accounts/${id}`,
  },

  catalog: {
    /** Tenant-wide rollup of per-client products. */
    clients: '/catalog',
    /** Tenant-wide rollup of per-vendor products. */
    vendors: '/vendor-catalog',
    // Legacy alias preserved for callers that pre-date the rename — points
    // at the client catalog. Remove once nothing references it.
    list: '/catalog',
  },

  /* --------------------------------------------------- 06 accounting core */
  accounts: {
    list:        '/accounts',
    one:         (id: Id) => `/accounts/${id}`,
    tree:        '/accounts/tree',
    suggestions: '/account-suggestions',
    trainSuggestions: '/account-suggestions/train',
  },

  journalEntries: {
    list:    '/journal-entries',
    one:     (id: Id) => `/journal-entries/${id}`,
    post:    (id: Id) => `/journal-entries/${id}/post`,
    reverse: (id: Id) => `/journal-entries/${id}/reverse`,
  },

  recurringJournalEntries: {
    list:   '/recurring-journal-entries',
    one:    (id: Id) => `/recurring-journal-entries/${id}`,
    toggle: (id: Id) => `/recurring-journal-entries/${id}/toggle`,
  },

  fiscalYears: {
    list:   '/fiscal-years',
    one:    (id: Id) => `/fiscal-years/${id}`,
  },
  fiscalPeriods: {
    close:  (id: Id) => `/fiscal-periods/${id}/close`,
    reopen: (id: Id) => `/fiscal-periods/${id}/reopen`,
  },

  /* ------------------------------------- 07 bank reconciliation & FX */
  bankReconciliation: {
    list:       '/bank-reconciliations',
    one:        (id: Id) => `/bank-reconciliations/${id}`,
    summary:    (id: Id) => `/bank-reconciliations/${id}/summary`,
    import:     (id: Id) => `/bank-reconciliations/${id}/import`,
    autoMatch:  (id: Id) => `/bank-reconciliations/${id}/auto-match`,
    smartMatch: (id: Id) => `/bank-reconciliations/${id}/smart-match`,
    autoPost:   (id: Id) => `/bank-reconciliations/${id}/auto-post`,
    categorize: (id: Id) => `/bank-reconciliations/${id}/categorize`,
    complete:   (id: Id) => `/bank-reconciliations/${id}/complete`,
  },
  bankStatementLines: {
    match:            (lineId: Id) => `/bank-reconciliations/lines/${lineId}/match`,
    unmatch:          (lineId: Id) => `/bank-reconciliations/lines/${lineId}/unmatch`,
    exclude:          (lineId: Id) => `/bank-reconciliations/lines/${lineId}/exclude`,
    matchInvoice:     (lineId: Id) => `/bank-statement-lines/${lineId}/match-invoice`,
    matchBill:        (lineId: Id) => `/bank-statement-lines/${lineId}/match-bill`,
    suggestions:      (lineId: Id) => `/bank-statement-lines/${lineId}/suggestions`,
    applySuggestion:  (lineId: Id) => `/bank-statement-lines/${lineId}/apply-suggestion`,
    learn:            (lineId: Id) => `/bank-statement-lines/${lineId}/learn`,
  },
  bankCategorizationRules: {
    list:   '/bank-categorization-rules',
    remove: (id: Id) => `/bank-categorization-rules/${id}`,
  },
  bankConnections: {
    dashboard:           '/bank-connections/dashboard',
    supportedFormats:    '/bank-connections/supported-formats',
    generateInstruction: '/bank-connections/generate-instruction',
    list:                '/bank-connections',
    one:                 (id: Id) => `/bank-connections/${id}`,
    syncBalance:         (id: Id) => `/bank-connections/${id}/sync-balance`,
    importStatement:     (id: Id) => `/bank-connections/${id}/import-statement`,
  },
  fxRevaluations: {
    list:    '/fx-revaluations',
    one:     (id: Id) => `/fx-revaluations/${id}`,
    post:    (id: Id) => `/fx-revaluations/${id}/post`,
    reverse: (id: Id) => `/fx-revaluations/${id}/reverse`,
  },

  /* ----------------------------------------------------- 08 invoicing & AR */
  invoices: {
    list:       '/invoices',
    one:        (id: Id) => `/invoices/${id}`,
    preCheck:   '/invoices/pre-check',
    cancel:     (id: Id) => `/invoices/${id}/cancel`,
    postToGL:   (id: Id) => `/invoices/${id}/post-to-gl`,
    creditNote: (id: Id) => `/invoices/${id}/credit-note`,
    pdf:        (id: Id) => `/invoices/${id}/pdf`,
    send:       (id: Id) => `/invoices/${id}/send`,
    writeOff:   (id: Id) => `/invoices/${id}/write-off`,
    escalate:   (id: Id) => `/invoices/${id}/escalate`,
  },
  recurringInvoices: {
    list: '/recurring-invoices',
    one:  (id: Id) => `/recurring-invoices/${id}`,
  },
  payments: {
    list:   '/payments',
    remove: (id: Id) => `/payments/${id}`,
  },
  collections: {
    overview:      '/collections/overview',
    actions:       '/collections/actions',
    client:        (clientId: Id) => `/collections/clients/${clientId}`,
    effectiveness: '/collections/reports/effectiveness',
  },
  invoiceSettings: {
    root: '/invoice-settings',
  },
  agingReminders: {
    settings:       '/aging-reminders/settings',
    history:        '/aging-reminders/history',
    invoiceHistory: (invoiceId: Id) => `/aging-reminders/invoices/${invoiceId}/history`,
    trigger:        '/aging-reminders/trigger',
  },

  /* --------------------------------------------------- 09 accounts payable */
  vendors: {
    list:        '/vendors',
    one:         (id: Id) => `/vendors/${id}`,
    statement:   (id: Id) => `/vendors/${id}/statement`,
    aging:       '/vendors/reports/aging',
    products:    (vendorId: Id) => `/vendors/${vendorId}/products`,
    productsOne: (vendorId: Id, productId: Id) => `/vendors/${vendorId}/products/${productId}`,
  },
  bills: {
    list:     '/bills',
    one:      (id: Id) => `/bills/${id}`,
    approve:  (id: Id) => `/bills/${id}/approve`,
    cancel:   (id: Id) => `/bills/${id}/cancel`,
    payments: (id: Id) => `/bills/${id}/payments`,
  },
  billPayments: {
    void: (id: Id) => `/bill-payments/${id}/void`,
  },

  /* ----------------------------------------------------------- 10 expenses */
  expenseCategories: {
    list: '/expense-categories',
    one:  (id: Id) => `/expense-categories/${id}`,
  },
  expenses: {
    list:       '/expenses',
    one:        (id: Id) => `/expenses/${id}`,
    submit:     (id: Id) => `/expenses/${id}/submit`,
    approve:    (id: Id) => `/expenses/${id}/approve`,
    reject:     (id: Id) => `/expenses/${id}/reject`,
    reimburse:  (id: Id) => `/expenses/${id}/reimburse`,
    bulkSubmit: '/expenses/bulk-submit',
    summary:    '/expenses/reports/summary',
  },
  expenseReports: {
    list:     '/expense-reports',
    one:      (id: Id) => `/expense-reports/${id}`,
    expenses: (id: Id) => `/expense-reports/${id}/expenses`,
    submit:   (id: Id) => `/expense-reports/${id}/submit`,
    approve:  (id: Id) => `/expense-reports/${id}/approve`,
    reject:   (id: Id) => `/expense-reports/${id}/reject`,
  },

  /* ------------------------------------------------------- 11 fixed assets */
  assetCategories: {
    list: '/asset-categories',
    one:  (id: Id) => `/asset-categories/${id}`,
  },
  fixedAssets: {
    list:                '/fixed-assets',
    one:                 (id: Id) => `/fixed-assets/${id}`,
    depreciationSchedule:(id: Id) => `/fixed-assets/${id}/depreciation-schedule`,
    depreciate:          '/fixed-assets/depreciate',
    register:            '/fixed-assets/reports/register',
    rollForward:         '/fixed-assets/reports/roll-forward',
    disposals:           (id: Id) => `/fixed-assets/${id}/disposals`,
    dispose:             (id: Id) => `/fixed-assets/${id}/dispose`,
  },

  /* ---------------------------------------------------------- 12 inventory */
  productCategories: {
    list: '/product-categories',
    one:  (id: Id) => `/product-categories/${id}`,
  },
  products: {
    list:      '/products',
    one:       (id: Id) => `/products/${id}`,
    movements: (id: Id) => `/products/${id}/movements`,
  },
  inventory: {
    movements:   '/inventory/movements',
    stockReport: '/inventory/stock-report',
    lowStock:    '/inventory/low-stock',
    valuation:   '/inventory/valuation',
    turnover:    '/inventory/turnover',
  },

  /* ------------------------------------------- 13 cost centers & budgeting */
  costCenters: {
    list:         '/cost-centers',
    one:          (id: Id) => `/cost-centers/${id}`,
    pnl:          (id: Id) => `/cost-centers/${id}/pnl`,
    costAnalysis: '/cost-centers/reports/cost-analysis',
    allocation:   '/cost-centers/reports/allocation',
  },
  budgets: {
    list:     '/budgets',
    one:      (id: Id) => `/budgets/${id}`,
    lines:    (id: Id) => `/budgets/${id}/lines`,
    approve:  (id: Id) => `/budgets/${id}/approve`,
    variance: (id: Id) => `/budgets/${id}/variance`,
  },

  /* ---------------------------------------------------- 14 tax management */
  whtCertificates: {
    list:     '/wht-certificates',
    generate: '/wht-certificates/generate',
    one:      (id: Id) => `/wht-certificates/${id}`,
    issue:    (id: Id) => `/wht-certificates/${id}/issue`,
    submit:   (id: Id) => `/wht-certificates/${id}/submit`,
  },
  taxReturns: {
    list:      '/tax-returns',
    one:       (id: Id) => `/tax-returns/${id}`,
    vat:       '/tax-returns/vat',
    corporate: '/tax-returns/corporate',
    file:      (id: Id) => `/tax-returns/${id}/file`,
    payment:   (id: Id) => `/tax-returns/${id}/payment`,
  },
  taxAdjustments: {
    forYear: (fiscalYear: Id) => `/tax-adjustments/${fiscalYear}`,
    create:  '/tax-adjustments',
    remove:  (id: Id) => `/tax-adjustments/${id}`,
  },

  /* ------------------------------------------------ 15 ETA E-Invoicing */
  eta: {
    settings:           '/eta/settings',
    documents:          '/eta/documents',
    document:           (invoiceId: Id) => `/eta/documents/${invoiceId}`,
    prepare:            (invoiceId: Id) => `/eta/documents/${invoiceId}/prepare`,
    submit:             (invoiceId: Id) => `/eta/documents/${invoiceId}/submit`,
    cancel:             (invoiceId: Id) => `/eta/documents/${invoiceId}/cancel`,
    checkStatus:        (invoiceId: Id) => `/eta/documents/${invoiceId}/check-status`,
    reconcile:          '/eta/reconcile',
    complianceDashboard:'/eta/compliance-dashboard',
    bulkRetry:          '/eta/bulk-retry',
    bulkStatusCheck:    '/eta/bulk-status-check',
    itemCodes: {
      list:         '/eta/item-codes',
      one:          (id: Id) => `/eta/item-codes/${id}`,
      bulkAssign:   '/eta/item-codes/bulk-assign',
      bulkImport:   '/eta/item-codes/bulk-import',
      autoAssign:   '/eta/item-codes/auto-assign',
      usageReport:  '/eta/item-codes/usage-report',
      unmappedLines:'/eta/item-codes/unmapped-lines',
      suggest:      '/eta/item-codes/suggest',
      mappings:     '/eta/item-codes/mappings',
      mapping:      (id: Id) => `/eta/item-codes/mappings/${id}`,
    },
  },

  /* ------------------------------------------ 16 payroll, attendance, leave */
  employees: {
    list:                '/employees',
    one:                 (id: Id) => `/employees/${id}`,
    salaryComponents:    (id: Id) => `/employees/${id}/salary-components`,
    leaveBalance:        (id: Id) => `/employees/${id}/leave-balance`,
    attendanceSummary:   (id: Id) => `/employees/${id}/attendance-summary`,
  },
  payroll: {
    runs:       '/payroll',
    run:        (id: Id) => `/payroll/${id}`,
    calculate:  (id: Id) => `/payroll/${id}/calculate`,
    approve:    (id: Id) => `/payroll/${id}/approve`,
    markPaid:   (id: Id) => `/payroll/${id}/mark-paid`,
    items:      (id: Id) => `/payroll/${id}/items`,
    payslip:    (runId: Id, itemId: Id) => `/payroll/${runId}/items/${itemId}/payslip`,
  },
  salaryComponents: {
    list: '/salary-components',
    one:  (id: Id) => `/salary-components/${id}`,
  },
  loans: {
    list:        '/loans',
    installment: (id: Id) => `/loans/${id}/installment`,
    cancel:      (id: Id) => `/loans/${id}/cancel`,
  },
  leaveTypes: {
    list: '/leave-types',
  },
  leaveRequests: {
    list:    '/leave-requests',
    approve: (id: Id) => `/leave-requests/${id}/approve`,
    reject:  (id: Id) => `/leave-requests/${id}/reject`,
    cancel:  (id: Id) => `/leave-requests/${id}/cancel`,
  },
  attendance: {
    list: '/attendance',
    bulk: '/attendance/bulk',
  },
  laborLaw: {
    overtime:          '/labor-law/overtime',
    endOfService:      '/labor-law/end-of-service',
    leaveEntitlement:  (employeeId: Id) => `/labor-law/leave-entitlement/${employeeId}`,
    validateWage:      '/labor-law/validate-wage',
    socialInsurance:   '/labor-law/social-insurance',
  },
  socialInsurance: {
    calculate:     '/social-insurance/calculate',
    monthlyReport: '/social-insurance/monthly-report',
    register:      '/social-insurance/register',
    rates:         '/social-insurance/rates',
  },

  /* ---------------------------------------------------- 17 timesheets */
  timesheets: {
    list:        '/timesheets',
    one:         (id: Id) => `/timesheets/${id}`,
    summary:     '/timesheets/summary',
    submit:      (id: Id) => `/timesheets/${id}/submit`,
    approve:     (id: Id) => `/timesheets/${id}/approve`,
    reject:      (id: Id) => `/timesheets/${id}/reject`,
    bulkApprove: '/timesheets/bulk-approve',
    bulkSubmit:  '/timesheets/bulk-submit',
  },
  timers: {
    start:   '/timers/start',
    current: '/timers/current',
    stop:    (id: Id) => `/timers/${id}/stop`,
    remove:  (id: Id) => `/timers/${id}`,
  },
  timeBilling: {
    preview:  '/time-billing/preview',
    generate: '/time-billing/generate',
  },

  /* ----------------------------------------------------- 18 engagements */
  engagements: {
    dashboard:      '/engagements/dashboard',
    list:           '/engagements',
    one:            (id: Id) => `/engagements/${id}`,
    timeAllocation: (id: Id) => `/engagements/${id}/time-allocation`,
    deliverables:   (id: Id) => `/engagements/${id}/deliverables`,
    completeDeliverable: (engagementId: Id, deliverableId: Id) =>
      `/engagements/${engagementId}/deliverables/${deliverableId}/complete`,
    workingPapers:  (id: Id) => `/engagements/${id}/working-papers`,
  },
  workingPapers: {
    one:    (id: Id) => `/working-papers/${id}`,
    review: (id: Id) => `/working-papers/${id}/review`,
  },

  /* ----------------------------------------------------- 19 reports */
  reports: {
    trialBalance:              '/reports/trial-balance',
    trialBalancePdf:           '/reports/trial-balance/pdf',
    accountLedger:             (accountId: Id) => `/reports/accounts/${accountId}/ledger`,
    clientStatement:           (clientId: Id) => `/reports/clients/${clientId}/statement`,
    aging:                     '/reports/aging',
    incomeStatement:           '/reports/income-statement',
    incomeStatementPdf:        '/reports/income-statement/pdf',
    balanceSheet:              '/reports/balance-sheet',
    balanceSheetPdf:           '/reports/balance-sheet/pdf',
    cashFlow:                  '/reports/cash-flow',
    cashFlowPdf:               '/reports/cash-flow/pdf',
    comparativeIncomeStatement:'/reports/comparative/income-statement',
    comparativeBalanceSheet:   '/reports/comparative/balance-sheet',
    vatReturn:                 '/reports/vat-return',
    vatReturnPdf:              '/reports/vat-return/pdf',
    wht:                       '/reports/wht',
    whtPdf:                    '/reports/wht/pdf',
    asyncPdf:                  '/reports/pdf/async',

    dashboard: {
      overview:     '/dashboard/overview',
      revenue:      '/dashboard/revenue',
      cashFlow:     '/dashboard/cash-flow',
      profitability:'/dashboard/profitability',
      kpis:         '/dashboard/kpis',
      comparison:   '/dashboard/comparison',
    },
  },
  customReports: {
    list:    '/custom-reports',
    one:     (id: Id) => `/custom-reports/${id}`,
    execute: '/custom-reports/execute',
    run:     (id: Id) => `/custom-reports/${id}/run`,
  },
  scheduledReports: {
    list:     '/scheduled-reports',
    one:      (id: Id) => `/scheduled-reports/${id}`,
    toggle:   (id: Id) => `/scheduled-reports/${id}/toggle`,
    sendNow:  (id: Id) => `/scheduled-reports/${id}/send-now`,
  },
  exporting: {
    clients:        '/export/clients',
    invoices:       '/export/invoices',
    journalEntries: '/export/journal-entries',
  },
  anomalies: {
    root:            '/anomalies',
    duplicates:      '/anomalies/duplicates',
    unusualAmounts:  '/anomalies/unusual-amounts',
    missingSequences:'/anomalies/missing-sequences',
    weekendEntries:  '/anomalies/weekend-entries',
  },

  /* -------------------------------------- 20 approval workflows & alerts */
  approvalWorkflows: {
    list: '/approval-workflows',
    one:  (id: Id) => `/approval-workflows/${id}`,
  },
  approvals: {
    submit:  '/approvals/submit',
    approve: (id: Id) => `/approvals/${id}/approve`,
    reject:  (id: Id) => `/approvals/${id}/reject`,
    pending: '/approvals/pending',
    history: '/approvals/history',
  },
  alertRules: {
    list:    '/alert-rules',
    history: '/alert-rules/history',
    one:     (id: Id) => `/alert-rules/${id}`,
    toggle:  (id: Id) => `/alert-rules/${id}/toggle`,
  },

  /* ----------------------------------------------------- 21 documents */
  documents: {
    list:      '/documents',
    one:       (id: Id) => `/documents/${id}`,
    quota:     '/documents/quota',
    bulk:      '/documents/bulk',
    download:  (id: Id) => `/documents/${id}/download`,
    archive:   (id: Id) => `/documents/${id}/archive`,
    unarchive: (id: Id) => `/documents/${id}/unarchive`,
  },

  /* ----------------------------------------------------- 22 e-commerce */
  ecommerce: {
    dashboard:     '/ecommerce/dashboard',
    bulkConvert:   '/ecommerce/bulk-convert',
    channels:      '/ecommerce/channels',
    channel:       (id: Id) => `/ecommerce/channels/${id}`,
    syncChannel:   (id: Id) => `/ecommerce/channels/${id}/sync`,
    convertOrder:  (orderId: Id) => `/ecommerce/orders/${orderId}/convert`,
  },

  /* ----------------------------------------------------- 23 messaging */
  messaging: {
    whatsapp:     '/messaging/whatsapp',
    sms:          '/messaging/sms',
    templates:    '/messaging/templates',
    conversations:'/messaging/conversations',
    conversation: (id: Id) => `/messaging/conversations/${id}`,
    reply:        (id: Id) => `/messaging/conversations/${id}/reply`,
  },

  /* ----------------------------------------------------- 24 currency */
  currencies: {
    list:         '/currencies',
    convert:      '/currencies/convert',
    rateHistory:  '/currencies/rate-history',
  },

  /* ---------------------------------------------- 25 team & onboarding */
  team: {
    list:         '/team',
    invite:       '/team/invite',
    one:          (id: Id) => `/team/${id}`,
    toggleActive: (id: Id) => `/team/${id}/toggle-active`,
    role:         (id: Id) => `/team/${id}/role`,
  },
  onboarding: {
    progress:         '/onboarding/progress',
    completeStep:     '/onboarding/complete-step',
    skip:             '/onboarding/skip',
    setupCoa:         '/onboarding/setup-coa',
    setupFiscalYear:  '/onboarding/setup-fiscal-year',
    loadSampleData:   '/onboarding/load-sample-data',
    inviteTeamMember: '/onboarding/invite-team-member',
  },
  onboardingWizard: {
    progress:       '/onboarding-wizard/progress',
    templates:      '/onboarding-wizard/templates',
    selectTemplate: '/onboarding-wizard/select-template',
    importBalances: '/onboarding-wizard/import-balances',
    completeStep:   '/onboarding-wizard/complete-step',
    skipStep:       '/onboarding-wizard/skip-step',
  },

  /* --------------------------------- 26 webhooks (outbound) & settings */
  webhooks: {
    events:     '/webhooks/events',
    list:       '/webhooks',
    one:        (id: Id) => `/webhooks/${id}`,
    deliveries: (id: Id) => `/webhooks/${id}/deliveries`,
  },
  landingPageSettings: {
    root: '/landing-page-settings',
  },
  branding: {
    root: '/branding',
    asset: (kind: 'logo' | 'favicon') => `/branding/asset/${kind}`,
  },

  /* ---------------------------------------------------- 27 data import */
  imports: {
    list:            '/import',
    create:          '/import',
    template:        (type: string) => `/import/template/${type}`,
    one:             (jobId: Id) => `/import/${jobId}`,
    clients:         '/import/clients',
    accounts:        '/import/accounts',
    openingBalances: '/import/opening-balances',
  },

  /* ---------------------------------------------------- 28 client portal */
  portal: {
    /** Anonymous endpoint hit by the magic-link landing page. */
    acceptInvite:    '/portal/accept-invite',
    dashboard:       '/portal/dashboard',
    profile:         '/portal/profile',
    invoices:        '/portal/invoices',
    invoice:         (id: Id) => `/portal/invoices/${id}`,
    pay:             (id: Id) => `/portal/invoices/${id}/pay`,
    invoicePdf:      (id: Id) => `/portal/invoices/${id}/pdf`,
    paymentGateways: '/portal/payment-gateways',
    documents:       '/portal/documents',
    documentDownload:(id: Id) => `/portal/documents/${id}/download`,
    messages:        '/portal/messages',
    message:         (id: Id) => `/portal/messages/${id}`,
    markMessageRead: (id: Id) => `/portal/messages/${id}/read`,
    notifications:   '/portal/notifications',
    markNotifRead:   (id: Id) => `/portal/notifications/${id}/read`,
    markAllNotifRead:'/portal/notifications/read-all',
  },
} as const

export type Endpoints = typeof ENDPOINTS
