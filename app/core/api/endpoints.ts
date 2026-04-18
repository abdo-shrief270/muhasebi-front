/**
 * Single source of truth for every API path the frontend calls.
 *
 * Rules:
 *   - Only paths live here — no query params, no headers, no types.
 *   - Static paths are strings; parameterized paths are functions.
 *   - Group by feature. One feature = one object under ENDPOINTS.
 *   - Services import ENDPOINTS and use the entries. No inline strings.
 *
 * Adding a new endpoint? Add it here first, then wire it in the feature's service.
 */

type Id = number | string

export const ENDPOINTS = {
  auth: {
    login:          '/login',
    logout:         '/logout',
    register:       '/register',
    forgotPassword: '/forgot-password',
    me:             '/me',
    subscription:   '/me/subscription',
    changePassword: '/change-password',
    profile:        '/profile',
  },

  clients: {
    list:         '/clients',
    one:          (id: Id) => `/clients/${id}`,
    toggleActive: (id: Id) => `/clients/${id}/toggle-active`,
  },

  invoices: {
    list:       '/invoices',
    one:        (id: Id) => `/invoices/${id}`,
    send:       (id: Id) => `/invoices/${id}/send`,
    cancel:     (id: Id) => `/invoices/${id}/cancel`,
    postToGL:   (id: Id) => `/invoices/${id}/post-to-gl`,
    creditNote: (id: Id) => `/invoices/${id}/credit-note`,
    pdf:        (id: Id) => `/invoices/${id}/pdf`,
    payments:   '/payments',
  },

  accounts: {
    list: '/accounts',
    one:  (id: Id) => `/accounts/${id}`,
    tree: '/accounts/tree',
  },

  journalEntries: {
    list:    '/journal-entries',
    one:     (id: Id) => `/journal-entries/${id}`,
    post:    (id: Id) => `/journal-entries/${id}/post`,
    reverse: (id: Id) => `/journal-entries/${id}/reverse`,
  },

  documents: {
    list:      '/documents',
    one:       (id: Id) => `/documents/${id}`,
    download:  (id: Id) => `/documents/${id}/download`,
    archive:   (id: Id) => `/documents/${id}/archive`,
    unarchive: (id: Id) => `/documents/${id}/unarchive`,
  },

  dashboard: {
    kpis: '/dashboard',
  },

  reports: {
    balanceSheet:    '/reports/balance-sheet',
    incomeStatement: '/reports/income-statement',
    cashFlow:        '/reports/cash-flow',
    trialBalance:    '/reports/trial-balance',
    ledger:          '/reports/ledger',
    aging:           '/reports/aging',
    comparative:     '/reports/comparative',
    clientStatement: '/reports/client-statement',
  },

  team: {
    list:         '/team',
    invite:       '/team/invite',
    one:          (id: Id) => `/team/${id}`,
    role:         (id: Id) => `/team/${id}/role`,
    toggleActive: (id: Id) => `/team/${id}/toggle-active`,
    roles:        '/roles',
  },

  timesheets: {
    list:    '/timesheets',
    one:     (id: Id) => `/timesheets/${id}`,
    summary: '/timesheets/summary',
  },

  timeBilling: {
    generate: '/time-billing/generate',
  },

  payroll: {
    runs:      '/payroll',
    one:       (id: Id) => `/payroll/${id}`,
    process:   (id: Id) => `/payroll/${id}/process`,
    employees: '/employees',
  },

  eta: {
    settings:   '/eta/settings',
    documents:  '/eta/documents',
    prepare:    (invoiceId: Id) => `/eta/documents/${invoiceId}/prepare`,
    submit:     (invoiceId: Id) => `/eta/documents/${invoiceId}/submit`,
    checkStatus:(invoiceId: Id) => `/eta/documents/${invoiceId}/check-status`,
    cancel:     (invoiceId: Id) => `/eta/documents/${invoiceId}/cancel`,
    itemCodes:  '/eta/item-codes',
    itemCode:   (id: Id) => `/eta/item-codes/${id}`,
    reconcile:  '/eta/reconcile',
  },

  subscription: {
    current: '/subscription',
    usage:   '/subscription/usage',
  },

  onboarding: {
    state: '/onboarding/state',
    step:  (step: string) => `/onboarding/${step}`,
  },

  notifications: {
    list:        '/notifications',
    preferences: '/notification-preferences',
    read:        (id: Id) => `/notifications/${id}/read`,
    readAll:     '/notifications/read-all',
  },

  messaging: {
    threads:  '/threads',
    thread:   (id: Id) => `/threads/${id}`,
    messages: (threadId: Id) => `/threads/${threadId}/messages`,
  },

  importing: {
    preview: '/import/preview',
    execute: '/import/execute',
  },

  twoFactor: {
    status:  '/2fa/status',
    enable:  '/2fa/enable',
    disable: '/2fa/disable',
  },

  portal: {
    invoices:      '/portal/invoices',
    invoice:       (id: Id) => `/portal/invoices/${id}`,
    documents:     '/portal/documents',
    messages:      '/portal/messages',
    notifications: '/portal/notifications',
    profile:       '/portal/profile',
  },

  public: {
    landing:      '/landing',
    plans:        '/plans',
    testimonials: '/testimonials',
    faqs:         '/faqs',
    page:         (slug: string) => `/pages/${slug}`,
    blog:         '/blog',
    blogPost:     (slug: string) => `/blog/${slug}`,
    blogFeatured: '/blog/featured',
    blogCategories: '/blog/categories',
    blogTags:     '/blog/tags',
    contact:      '/contact',
  },
} as const

export type Endpoints = typeof ENDPOINTS
