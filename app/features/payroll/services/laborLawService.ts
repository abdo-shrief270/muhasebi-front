import { ENDPOINTS } from '~/core/api/endpoints'
import type { ItemResponse } from '~/shared/types/common'

export interface OvertimePayload {
  employee_id: number
  hours: number
  wage_rate?: number
  overtime_type: 'regular' | 'holiday' | 'night'
}

export interface OvertimeResult {
  base_wage: number
  multiplier: number
  overtime_pay: number
  total: number
}

export interface EndOfServicePayload {
  employee_id: number
  termination_date: string
  reason: string
}

export interface EndOfServiceResult {
  years_of_service: number
  base_per_year: number
  gratuity: number
}

export interface LeaveEntitlement {
  years_of_service: number
  entitled_days: number
  statutory_minimum: number
}

export interface WageValidation {
  amount: number
  minimum_wage: number
  valid: boolean
}

export interface SocialInsuranceResult {
  employer_contribution: number
  employee_contribution: number
  insurable_wage: number
  bracket: string
}

export interface SocialInsuranceCalcPayload {
  period_month: number
  period_year: number
  employee_ids?: number[]
}

export function laborLawService() {
  const api = useApi()

  return {
    overtime: (payload: OvertimePayload) =>
      api.post<ItemResponse<OvertimeResult>>(ENDPOINTS.laborLaw.overtime, payload).then(r => r.data),
    endOfService: (payload: EndOfServicePayload) =>
      api.post<ItemResponse<EndOfServiceResult>>(ENDPOINTS.laborLaw.endOfService, payload).then(r => r.data),
    leaveEntitlement: (employeeId: number) =>
      api.get<ItemResponse<LeaveEntitlement>>(ENDPOINTS.laborLaw.leaveEntitlement(employeeId)).then(r => r.data),
    validateWage: (payload: { amount: number; date: string }) =>
      api.post<ItemResponse<WageValidation>>(ENDPOINTS.laborLaw.validateWage, payload).then(r => r.data),
    previewSocialInsurance: (payload: { employee_id: number; gross_wage: number }) =>
      api.post<ItemResponse<SocialInsuranceResult>>(ENDPOINTS.laborLaw.socialInsurance, payload).then(r => r.data),
  }
}

export function socialInsuranceService() {
  const api = useApi()

  return {
    calculate: (payload: SocialInsuranceCalcPayload, idempotencyKey?: string) =>
      api.post<ItemResponse<{ total_employer: number; total_employee: number; rows: Array<{ employee_id: number; result: SocialInsuranceResult }> }>>(
        ENDPOINTS.socialInsurance.calculate, payload, { idempotencyKey },
      ).then(r => r.data),
    monthlyReport: (params: { period_month: number; period_year: number; format?: 'json' | 'pdf' }) => {
      const q = new URLSearchParams(params as any).toString()
      return api.get<{ data: Record<string, unknown> }>(`${ENDPOINTS.socialInsurance.monthlyReport}?${q}`)
    },
    register: (employeeId: number, idempotencyKey?: string) =>
      api.post<{ message: string }>(ENDPOINTS.socialInsurance.register, { employee_id: employeeId }, { idempotencyKey }),
    rates: () =>
      api.get<{ data: Array<{ bracket: string; from: number; to: number; employer_pct: number; employee_pct: number }> }>(
        ENDPOINTS.socialInsurance.rates,
      ).then(r => r.data),
  }
}
