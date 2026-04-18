import { ENDPOINTS } from '~/core/api/endpoints'
import type { ItemResponse } from '~/shared/types/common'

export interface DateRangeQuery {
  from?: string
  to?: string
  currency?: string
}

// -------- core financial reports --------
export interface TrialBalanceRow {
  code: string
  name: string
  opening: string
  debit: string
  credit: string
  closing: string
}
export interface TrialBalanceReport {
  from: string; to: string; currency: string
  accounts: TrialBalanceRow[]
  totals: { debit: string; credit: string }
}

export interface AccountLedgerReport {
  account: { id: number; code: string; name: string }
  opening_balance: string
  lines: Array<{ date: string; entry_number: string; description: string; debit: string; credit: string; running_balance: string }>
  closing_balance: string
}

export interface ClientStatementReport {
  client: { id: number; name: string; tax_id: string | null }
  opening_balance: string
  transactions: Array<{ date: string; type: 'invoice' | 'payment' | 'credit_note'; reference: string; debit: string; credit: string; balance: string }>
  closing_balance: string
}

export interface AgingReport {
  as_of: string
  buckets: { current: string; '1_30': string; '31_60': string; '61_90': string; '90_plus': string }
  clients: Array<{ client_id: number; name: string; total: string; current: string; '1_30': string; '31_60': string; '61_90': string; '90_plus': string }>
}

export interface IncomeStatementReport {
  from: string; to: string; currency: string
  revenue: { total: string; accounts: Array<{ code: string; name: string; amount: string }> }
  expenses: { total: string; accounts: Array<{ code: string; name: string; amount: string }> }
  net_income: string
}

export interface BalanceSheetReport {
  as_of: string; currency: string
  assets: { total: string; accounts: Array<{ code: string; name: string; amount: string }> }
  liabilities: { total: string; accounts: Array<{ code: string; name: string; amount: string }> }
  equity: { total: string; accounts: Array<{ code: string; name: string; amount: string }> }
}

export interface CashFlowReport {
  from: string; to: string; currency: string
  operating: string; investing: string; financing: string; net_change: string
  lines: Array<{ category: string; description: string; amount: string }>
}

export interface ComparativeReport<T> { current: T; prior: T }

export interface VatReturnReport {
  period: { start: string; end: string }
  output_vat: string
  input_vat: string
  net_vat_payable: string
  rates_breakdown: Record<string, { sales: string; vat: string }>
}

export interface WhtReport {
  period: { start: string; end: string }
  total_withheld: string
  rows: Array<{ vendor_id: number; vendor: string; amount: string; rate: number; wht: string }>
}

// -------- executive dashboard --------
export interface DashboardOverview {
  revenue: number
  expenses: number
  profit: number
  cash_on_hand: number
  outstanding_ar: number
  outstanding_ap: number
}

export interface RevenueAnalysis {
  trend: Array<{ period: string; revenue: number; cogs: number; gross_profit: number }>
  by_client: Array<{ client_id: number; name: string; revenue: number }>
}

// -------- custom reports --------
export interface CustomReportDefinition {
  id: number
  name: string
  entity: string
  columns: string[]
  filters: Array<{ field: string; op: string; value: unknown }>
  group_by: string[]
  sort_by: Array<{ field: string; dir: 'asc' | 'desc' }>
  created_at: string
}

export type CustomReportForm = Omit<CustomReportDefinition, 'id' | 'created_at'>

// -------- scheduled reports --------
export type ScheduleFrequency = 'daily' | 'weekly' | 'monthly' | 'quarterly'

export interface ScheduledReport {
  id: number
  name: string
  report_type: string
  params: Record<string, unknown>
  frequency: ScheduleFrequency
  recipients: string[]
  format: 'pdf' | 'csv' | 'xlsx'
  is_enabled: boolean
  last_run_at: string | null
  next_run_at: string | null
}

export type ScheduledReportForm = Omit<ScheduledReport, 'id' | 'last_run_at' | 'next_run_at'>

// -------- anomalies --------
export interface AnomalySummary {
  duplicates: Array<{ id: number; description: string; reason: string }>
  unusual_amounts: Array<{ id: number; description: string; amount: number; reason: string }>
  missing_sequences: Array<{ expected: string; reason: string }>
  weekend_entries: Array<{ id: number; date: string; description: string }>
}

function toQuery(p: Record<string, unknown>): string {
  const q = new URLSearchParams()
  for (const [k, v] of Object.entries(p)) {
    if (v === '' || v == null) continue
    q.set(k, String(v))
  }
  return q.toString() ? `?${q}` : ''
}

export function reportsService() {
  const api = useApi()
  const pdf = (url: string, qs: string) => `${url}${qs}`

  return {
    trialBalance: (q: DateRangeQuery = {}) =>
      api.get<TrialBalanceReport>(`${ENDPOINTS.reports.trialBalance}${toQuery(q)}`),
    trialBalancePdfUrl: (q: DateRangeQuery = {}) =>
      pdf(ENDPOINTS.reports.trialBalancePdf, toQuery(q)),

    accountLedger: (accountId: number, q: DateRangeQuery = {}) =>
      api.get<AccountLedgerReport>(`${ENDPOINTS.reports.accountLedger(accountId)}${toQuery(q)}`),
    clientStatement: (clientId: number, q: DateRangeQuery = {}) =>
      api.get<ClientStatementReport>(`${ENDPOINTS.reports.clientStatement(clientId)}${toQuery(q)}`),
    aging: (q: { client_id?: number } = {}) =>
      api.get<AgingReport>(`${ENDPOINTS.reports.aging}${toQuery(q)}`),

    incomeStatement: (q: DateRangeQuery = {}) =>
      api.get<IncomeStatementReport>(`${ENDPOINTS.reports.incomeStatement}${toQuery(q)}`),
    incomeStatementPdfUrl: (q: DateRangeQuery = {}) =>
      pdf(ENDPOINTS.reports.incomeStatementPdf, toQuery(q)),

    balanceSheet: (q: DateRangeQuery = {}) =>
      api.get<BalanceSheetReport>(`${ENDPOINTS.reports.balanceSheet}${toQuery(q)}`),
    balanceSheetPdfUrl: (q: DateRangeQuery = {}) =>
      pdf(ENDPOINTS.reports.balanceSheetPdf, toQuery(q)),

    cashFlow: (q: DateRangeQuery = {}) =>
      api.get<CashFlowReport>(`${ENDPOINTS.reports.cashFlow}${toQuery(q)}`),
    cashFlowPdfUrl: (q: DateRangeQuery = {}) =>
      pdf(ENDPOINTS.reports.cashFlowPdf, toQuery(q)),

    comparativeIncomeStatement: (q: DateRangeQuery = {}) =>
      api.get<ComparativeReport<IncomeStatementReport>>(`${ENDPOINTS.reports.comparativeIncomeStatement}${toQuery(q)}`),
    comparativeBalanceSheet: (q: DateRangeQuery = {}) =>
      api.get<ComparativeReport<BalanceSheetReport>>(`${ENDPOINTS.reports.comparativeBalanceSheet}${toQuery(q)}`),

    vatReturn: (q: DateRangeQuery = {}) =>
      api.get<VatReturnReport>(`${ENDPOINTS.reports.vatReturn}${toQuery(q)}`),
    vatReturnPdfUrl: (q: DateRangeQuery = {}) =>
      pdf(ENDPOINTS.reports.vatReturnPdf, toQuery(q)),
    wht: (q: DateRangeQuery = {}) =>
      api.get<WhtReport>(`${ENDPOINTS.reports.wht}${toQuery(q)}`),
    whtPdfUrl: (q: DateRangeQuery = {}) =>
      pdf(ENDPOINTS.reports.whtPdf, toQuery(q)),

    asyncPdf: (payload: { report: string; params: Record<string, unknown> }, idempotencyKey?: string) =>
      api.post<ItemResponse<{ job_id: string; status: string }>>(
        ENDPOINTS.reports.asyncPdf, payload, { idempotencyKey },
      ).then(r => r.data),

    dashboard: {
      overview: (q: DateRangeQuery = {}) =>
        api.get<ItemResponse<DashboardOverview>>(`${ENDPOINTS.reports.dashboard.overview}${toQuery(q)}`).then(r => r.data),
      revenue: (q: DateRangeQuery = {}) =>
        api.get<ItemResponse<RevenueAnalysis>>(`${ENDPOINTS.reports.dashboard.revenue}${toQuery(q)}`).then(r => r.data),
      cashFlow: (q: DateRangeQuery = {}) =>
        api.get<ItemResponse<CashFlowReport>>(`${ENDPOINTS.reports.dashboard.cashFlow}${toQuery(q)}`).then(r => r.data),
      profitability: (q: DateRangeQuery = {}) =>
        api.get<ItemResponse<Record<string, unknown>>>(`${ENDPOINTS.reports.dashboard.profitability}${toQuery(q)}`).then(r => r.data),
      kpis: (q: DateRangeQuery = {}) =>
        api.get<ItemResponse<Record<string, number>>>(`${ENDPOINTS.reports.dashboard.kpis}${toQuery(q)}`).then(r => r.data),
      comparison: (q: DateRangeQuery & { prior_from?: string; prior_to?: string } = {}) =>
        api.get<ItemResponse<ComparativeReport<Record<string, number>>>>(`${ENDPOINTS.reports.dashboard.comparison}${toQuery(q)}`).then(r => r.data),
    },
  }
}

export function customReportsService() {
  const api = useApi()
  return {
    list: () =>
      api.get<{ data: CustomReportDefinition[] }>(ENDPOINTS.customReports.list).then(r => r.data),
    get: (id: number) =>
      api.get<ItemResponse<CustomReportDefinition>>(ENDPOINTS.customReports.one(id)).then(r => r.data),
    create: (form: CustomReportForm, idempotencyKey?: string) =>
      api.post<ItemResponse<CustomReportDefinition>>(ENDPOINTS.customReports.list, form, { idempotencyKey }).then(r => r.data),
    update: (id: number, form: Partial<CustomReportForm>) =>
      api.put<ItemResponse<CustomReportDefinition>>(ENDPOINTS.customReports.one(id), form).then(r => r.data),
    remove: (id: number) =>
      api.delete<void>(ENDPOINTS.customReports.one(id)),
    executeAdHoc: (form: CustomReportForm) =>
      api.post<{ data: Array<Record<string, unknown>> }>(ENDPOINTS.customReports.execute, form),
    run: (id: number, params: Record<string, unknown> = {}) =>
      api.get<{ data: Array<Record<string, unknown>> }>(`${ENDPOINTS.customReports.run(id)}${toQuery(params)}`),
  }
}

export function scheduledReportsService() {
  const api = useApi()
  return {
    list: () =>
      api.get<{ data: ScheduledReport[] }>(ENDPOINTS.scheduledReports.list).then(r => r.data),
    get: (id: number) =>
      api.get<ItemResponse<ScheduledReport>>(ENDPOINTS.scheduledReports.one(id)).then(r => r.data),
    create: (form: ScheduledReportForm, idempotencyKey?: string) =>
      api.post<ItemResponse<ScheduledReport>>(ENDPOINTS.scheduledReports.list, form, { idempotencyKey }).then(r => r.data),
    update: (id: number, form: Partial<ScheduledReportForm>) =>
      api.put<ItemResponse<ScheduledReport>>(ENDPOINTS.scheduledReports.one(id), form).then(r => r.data),
    remove: (id: number) =>
      api.delete<void>(ENDPOINTS.scheduledReports.one(id)),
    toggle: (id: number) =>
      api.post<ItemResponse<ScheduledReport>>(ENDPOINTS.scheduledReports.toggle(id)).then(r => r.data),
    sendNow: (id: number, idempotencyKey?: string) =>
      api.post<{ message: string }>(ENDPOINTS.scheduledReports.sendNow(id), undefined, { idempotencyKey }),
  }
}

export function anomaliesService() {
  const api = useApi()
  return {
    summary: () =>
      api.get<{ data: AnomalySummary; message?: string }>(ENDPOINTS.anomalies.root).then(r => r.data),
    duplicates: () =>
      api.get<{ data: AnomalySummary['duplicates'] }>(ENDPOINTS.anomalies.duplicates).then(r => r.data),
    unusualAmounts: () =>
      api.get<{ data: AnomalySummary['unusual_amounts'] }>(ENDPOINTS.anomalies.unusualAmounts).then(r => r.data),
    missingSequences: () =>
      api.get<{ data: AnomalySummary['missing_sequences'] }>(ENDPOINTS.anomalies.missingSequences).then(r => r.data),
    weekendEntries: () =>
      api.get<{ data: AnomalySummary['weekend_entries'] }>(ENDPOINTS.anomalies.weekendEntries).then(r => r.data),
  }
}

export function exportingService() {
  const api = useApi()
  const csvUrl = (base: string, q: Record<string, unknown>) => `${base}${toQuery(q)}`
  return {
    clientsCsvUrl:        (q: Record<string, unknown> = {}) => csvUrl(ENDPOINTS.exporting.clients, q),
    invoicesCsvUrl:       (q: Record<string, unknown> = {}) => csvUrl(ENDPOINTS.exporting.invoices, q),
    journalEntriesCsvUrl: (q: Record<string, unknown> = {}) => csvUrl(ENDPOINTS.exporting.journalEntries, q),
    clients:        (q: Record<string, unknown> = {}) =>
      api.get<string>(csvUrl(ENDPOINTS.exporting.clients, q), { headers: { Accept: 'text/csv' } }),
    invoices:       (q: Record<string, unknown> = {}) =>
      api.get<string>(csvUrl(ENDPOINTS.exporting.invoices, q), { headers: { Accept: 'text/csv' } }),
    journalEntries: (q: Record<string, unknown> = {}) =>
      api.get<string>(csvUrl(ENDPOINTS.exporting.journalEntries, q), { headers: { Accept: 'text/csv' } }),
  }
}
