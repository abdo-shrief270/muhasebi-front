import { ENDPOINTS } from '~/core/api/endpoints'
import type { BaseListParams, ItemResponse, ListResponse } from '~/shared/types/common'

export type LeaveAccrualMethod = 'annual' | 'monthly' | 'none'
export type LeaveRequestStatus = 'pending' | 'approved' | 'rejected' | 'cancelled'

export interface LeaveType {
  id: number
  name_ar: string
  name_en: string | null
  days_per_year: number
  paid: boolean
  requires_approval: boolean
  accrual_method: LeaveAccrualMethod
}

export type LeaveTypeForm = Omit<LeaveType, 'id'>

export interface LeaveRequest {
  id: number
  employee_id: number
  leave_type_id: number
  from_date: string
  to_date: string
  days: number
  reason: string | null
  status: LeaveRequestStatus
  attachments: number[]
  approved_at: string | null
  rejected_at: string | null
  rejection_reason: string | null
  created_at: string
  employee?: { id: number; first_name: string; last_name: string }
  leave_type?: LeaveType
}

export interface LeaveRequestForm {
  employee_id: number
  leave_type_id: number
  from_date: string
  to_date: string
  days: number
  reason?: string
  attachments?: number[]
}

export interface LeaveRequestListParams extends BaseListParams {
  employee_id?: number
  status?: LeaveRequestStatus
  from_date?: string
  to_date?: string
}

// ---- attendance ----
export type AttendanceStatus = 'present' | 'absent' | 'leave' | 'holiday'

export interface AttendanceRecord {
  id: number
  employee_id: number
  date: string
  check_in: string | null
  check_out: string | null
  status: AttendanceStatus
  overtime_hours: number
  notes: string | null
}

export interface AttendanceForm {
  employee_id: number
  date: string
  check_in?: string
  check_out?: string
  status: AttendanceStatus
  overtime_hours?: number
  notes?: string
}

export interface AttendanceListParams extends BaseListParams {
  employee_id?: number
  from_date?: string
  to_date?: string
  department?: string
}

function toQuery(p: Record<string, unknown>): string {
  const q = new URLSearchParams()
  for (const [k, v] of Object.entries(p)) {
    if (v === '' || v == null) continue
    q.set(k, String(v))
  }
  return q.toString() ? `?${q}` : ''
}

export function leaveTypeService() {
  const api = useApi()
  return {
    list: () =>
      api.get<{ data: LeaveType[] }>(ENDPOINTS.leaveTypes.list).then(r => r.data),
    create: (form: LeaveTypeForm, idempotencyKey?: string) =>
      api.post<ItemResponse<LeaveType>>(ENDPOINTS.leaveTypes.list, form, { idempotencyKey }).then(r => r.data),
  }
}

export function leaveRequestService() {
  const api = useApi()
  return {
    list: (params: LeaveRequestListParams = {}) =>
      api.get<ListResponse<LeaveRequest>>(`${ENDPOINTS.leaveRequests.list}${toQuery(params)}`),
    create: (form: LeaveRequestForm, idempotencyKey?: string) =>
      api.post<ItemResponse<LeaveRequest>>(ENDPOINTS.leaveRequests.list, form, { idempotencyKey }).then(r => r.data),
    approve: (id: number, idempotencyKey?: string) =>
      api.post<ItemResponse<LeaveRequest>>(ENDPOINTS.leaveRequests.approve(id), undefined, { idempotencyKey }).then(r => r.data),
    reject: (id: number, reason: string, idempotencyKey?: string) =>
      api.post<ItemResponse<LeaveRequest>>(ENDPOINTS.leaveRequests.reject(id), { reason }, { idempotencyKey }).then(r => r.data),
    cancel: (id: number, idempotencyKey?: string) =>
      api.post<ItemResponse<LeaveRequest>>(ENDPOINTS.leaveRequests.cancel(id), undefined, { idempotencyKey }).then(r => r.data),
  }
}

export function attendanceService() {
  const api = useApi()
  return {
    list: (params: AttendanceListParams = {}) =>
      api.get<ListResponse<AttendanceRecord>>(`${ENDPOINTS.attendance.list}${toQuery(params)}`),
    record: (form: AttendanceForm, idempotencyKey?: string) =>
      api.post<ItemResponse<AttendanceRecord>>(ENDPOINTS.attendance.list, form, { idempotencyKey }).then(r => r.data),
    bulk: (records: AttendanceForm[], idempotencyKey?: string) =>
      api.post<{ data: { recorded: number } }>(ENDPOINTS.attendance.bulk, { records }, { idempotencyKey }),
  }
}
