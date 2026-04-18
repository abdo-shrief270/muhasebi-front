import { ENDPOINTS } from '~/core/api/endpoints'
import type { BaseListParams, ItemResponse, ListResponse } from '~/shared/types/common'

export type EmploymentType = 'full_time' | 'part_time' | 'contractor' | 'intern'
export type EmployeeStatus = 'active' | 'inactive' | 'terminated'

export interface Employee {
  id: number
  first_name: string
  last_name: string
  national_id: string | null
  email: string | null
  phone: string | null
  hire_date: string
  job_title: string
  department: string | null
  cost_center_id: number | null
  employment_type: EmploymentType
  basic_salary: number
  currency: string
  bank_name: string | null
  bank_account: string | null
  social_insurance_number: string | null
  tax_number: string | null
  address: string | null
  date_of_birth: string | null
  gender: 'male' | 'female' | null
  marital_status: 'single' | 'married' | 'divorced' | 'widowed' | null
  dependents: number | null
  status: EmployeeStatus
  created_at: string
}

export type EmployeeForm = Partial<Omit<Employee, 'id' | 'status' | 'created_at'>> & {
  first_name: string
  last_name: string
  hire_date: string
  job_title: string
  basic_salary: number
}

export interface EmployeeListParams extends BaseListParams {
  department?: string
  status?: EmployeeStatus
}

export interface LeaveBalanceSlice {
  entitled: number
  used: number
  pending: number
  available: number
}

export type EmployeeLeaveBalance = Record<string, LeaveBalanceSlice>

export interface AttendanceSummary {
  from_date: string
  to_date: string
  working_days: number
  present_days: number
  absent_days: number
  leave_days: number
  late_days: number
  overtime_hours: number
}

function toQuery(p: Record<string, unknown>): string {
  const q = new URLSearchParams()
  for (const [k, v] of Object.entries(p)) {
    if (v === '' || v == null) continue
    q.set(k, String(v))
  }
  return q.toString() ? `?${q}` : ''
}

export function employeeService() {
  const api = useApi()

  return {
    list: (params: EmployeeListParams = {}) =>
      api.get<ListResponse<Employee>>(`${ENDPOINTS.employees.list}${toQuery(params)}`),
    get: (id: number) =>
      api.get<ItemResponse<Employee>>(ENDPOINTS.employees.one(id)).then(r => r.data),
    create: (form: EmployeeForm, idempotencyKey?: string) =>
      api.post<ItemResponse<Employee>>(ENDPOINTS.employees.list, form, { idempotencyKey }).then(r => r.data),
    update: (id: number, form: Partial<EmployeeForm>) =>
      api.put<ItemResponse<Employee>>(ENDPOINTS.employees.one(id), form).then(r => r.data),
    remove: (id: number) =>
      api.delete<void>(ENDPOINTS.employees.one(id)),

    leaveBalance: (id: number) =>
      api.get<ItemResponse<EmployeeLeaveBalance>>(ENDPOINTS.employees.leaveBalance(id)).then(r => r.data),
    attendanceSummary: (id: number, params: { from_date?: string; to_date?: string } = {}) =>
      api.get<ItemResponse<AttendanceSummary>>(`${ENDPOINTS.employees.attendanceSummary(id)}${toQuery(params)}`).then(r => r.data),
    getSalaryComponents: (id: number) =>
      api.get<{ data: Array<{ id: number; salary_component_id: number; amount: number; start_date: string; end_date: string | null }> }>(
        ENDPOINTS.employees.salaryComponents(id),
      ).then(r => r.data),
    assignSalaryComponent: (id: number, payload: { salary_component_id: number; amount?: number; start_date: string; end_date?: string }, idempotencyKey?: string) =>
      api.post<ItemResponse<{ id: number }>>(ENDPOINTS.employees.salaryComponents(id), payload, { idempotencyKey }).then(r => r.data),
  }
}
