import { ENDPOINTS } from '~/core/api/endpoints'
import type { BaseListParams, ItemResponse, ListResponse } from '~/shared/types/common'

export type PayrollRunStatus = 'draft' | 'calculated' | 'approved' | 'paid' | 'cancelled'

export interface PayrollRun {
  id: number
  period_month: number
  period_year: number
  date_from: string
  date_to: string
  status: PayrollRunStatus
  total_gross: number
  total_deductions: number
  total_net: number
  employees_count: number
  notes: string | null
  approved_at: string | null
  paid_at: string | null
  created_at: string
}

export interface PayrollRunForm {
  period_month: number
  period_year: number
  date_from: string
  date_to: string
  employee_ids?: number[]
  notes?: string
}

export interface PayrollRunListParams extends BaseListParams {
  status?: PayrollRunStatus
  year?: number
  month?: number
}

export interface PayrollItem {
  id: number
  payroll_run_id: number
  employee_id: number
  gross: number
  deductions: number
  income_tax: number
  social_insurance_employee: number
  social_insurance_employer: number
  net: number
  components: Array<{ name: string; type: 'earning' | 'deduction'; amount: number }>
}

export interface MarkPaidPayload {
  payment_date: string
  bank_account_id: number
  reference?: string
}

// ---- salary components ----
export type SalaryComponentType = 'earning' | 'deduction'
export type ComponentCalculation = 'fixed' | 'percent_of_basic' | 'percent_of_gross' | 'formula'
export type ComponentFrequency = 'monthly' | 'quarterly' | 'annually'

export interface SalaryComponent {
  id: number
  name_en: string | null
  name_ar: string
  type: SalaryComponentType
  calculation: ComponentCalculation
  amount: number | null
  percent: number | null
  formula: string | null
  is_taxable: boolean
  is_insurable: boolean
  account_id: number | null
  frequency: ComponentFrequency
}

export type SalaryComponentForm = Omit<SalaryComponent, 'id'>

// ---- loans ----
export type LoanStatus = 'active' | 'paid' | 'cancelled'

export interface Loan {
  id: number
  employee_id: number
  amount: number
  interest_rate: number
  start_date: string
  installments: number
  frequency: 'monthly'
  remaining_balance: number
  status: LoanStatus
  notes: string | null
  created_at: string
}

export interface LoanForm {
  employee_id: number
  amount: number
  interest_rate?: number
  start_date: string
  installments: number
  frequency?: 'monthly'
  notes?: string
}

function toQuery(p: Record<string, unknown>): string {
  const q = new URLSearchParams()
  for (const [k, v] of Object.entries(p)) {
    if (v === '' || v == null) continue
    q.set(k, String(v))
  }
  return q.toString() ? `?${q}` : ''
}

export function payrollService() {
  const api = useApi()

  return {
    listRuns: (params: PayrollRunListParams = {}) =>
      api.get<ListResponse<PayrollRun>>(`${ENDPOINTS.payroll.runs}${toQuery(params)}`),
    getRun: (id: number) =>
      api.get<ItemResponse<PayrollRun>>(ENDPOINTS.payroll.run(id)).then(r => r.data),
    createRun: (form: PayrollRunForm, idempotencyKey?: string) =>
      api.post<ItemResponse<PayrollRun>>(ENDPOINTS.payroll.runs, form, { idempotencyKey }).then(r => r.data),
    removeRun: (id: number) =>
      api.delete<void>(ENDPOINTS.payroll.run(id)),

    calculate: (id: number, idempotencyKey: string) =>
      api.post<ItemResponse<PayrollRun>>(ENDPOINTS.payroll.calculate(id), undefined, { idempotencyKey }).then(r => r.data),
    approve: (id: number, idempotencyKey: string) =>
      api.post<ItemResponse<PayrollRun>>(ENDPOINTS.payroll.approve(id), undefined, { idempotencyKey }).then(r => r.data),
    markPaid: (id: number, payload: MarkPaidPayload, idempotencyKey: string) =>
      api.post<ItemResponse<PayrollRun>>(ENDPOINTS.payroll.markPaid(id), payload, { idempotencyKey }).then(r => r.data),

    items: (id: number) =>
      api.get<{ data: PayrollItem[] }>(ENDPOINTS.payroll.items(id)).then(r => r.data),
    payslipUrl: (runId: number, itemId: number) =>
      ENDPOINTS.payroll.payslip(runId, itemId),
  }
}

export function salaryComponentService() {
  const api = useApi()

  return {
    list: () =>
      api.get<{ data: SalaryComponent[] }>(ENDPOINTS.salaryComponents.list).then(r => r.data),
    create: (form: SalaryComponentForm, idempotencyKey?: string) =>
      api.post<ItemResponse<SalaryComponent>>(ENDPOINTS.salaryComponents.list, form, { idempotencyKey }).then(r => r.data),
    update: (id: number, form: Partial<SalaryComponentForm>) =>
      api.put<ItemResponse<SalaryComponent>>(ENDPOINTS.salaryComponents.one(id), form).then(r => r.data),
    remove: (id: number) =>
      api.delete<void>(ENDPOINTS.salaryComponents.one(id)),
  }
}

export function loanService() {
  const api = useApi()

  return {
    list: (params: BaseListParams & { employee_id?: number; status?: LoanStatus } = {}) =>
      api.get<ListResponse<Loan>>(`${ENDPOINTS.loans.list}${toQuery(params)}`),
    create: (form: LoanForm, idempotencyKey?: string) =>
      api.post<ItemResponse<Loan>>(ENDPOINTS.loans.list, form, { idempotencyKey }).then(r => r.data),
    recordInstallment: (id: number, payload: { amount: number; payment_date: string }, idempotencyKey: string) =>
      api.post<ItemResponse<Loan>>(ENDPOINTS.loans.installment(id), payload, { idempotencyKey }).then(r => r.data),
    cancel: (id: number, reason: string, idempotencyKey?: string) =>
      api.post<ItemResponse<Loan>>(ENDPOINTS.loans.cancel(id), { reason }, { idempotencyKey }).then(r => r.data),
  }
}
