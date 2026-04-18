import { ENDPOINTS } from '~/core/api/endpoints'
import type { BaseListParams, ItemResponse, ListResponse } from '~/shared/types/common'

export type TimesheetStatus = 'draft' | 'submitted' | 'approved' | 'rejected'

export interface TimesheetEntry {
  id?: number
  date: string
  hours: number
  client_id?: number | null
  engagement_id?: number | null
  project_id?: number | null
  task?: string | null
  billable: boolean
  description?: string | null
}

export interface Timesheet {
  id: number
  employee_id: number
  week_start: string
  week_end: string
  status: TimesheetStatus
  total_hours: number
  billable_hours: number
  notes: string | null
  submitted_at: string | null
  approved_at: string | null
  rejected_at: string | null
  rejection_reason: string | null
  entries?: TimesheetEntry[]
  employee?: { id: number; first_name: string; last_name: string }
  created_at: string
}

export interface TimesheetForm {
  employee_id: number
  week_start: string
  notes?: string
  entries: TimesheetEntry[]
}

export interface TimesheetListParams extends BaseListParams {
  employee_id?: number
  status?: TimesheetStatus
  from_date?: string
  to_date?: string
}

export interface TimesheetSummary {
  total_hours: number
  billable_hours: number
  per_employee: Array<{ employee_id: number; name: string; hours: number }>
  per_client: Array<{ client_id: number; name: string; hours: number }>
  per_project: Array<{ project_id: number; name: string; hours: number }>
}

// ---- timers ----
export interface RunningTimer {
  id: number
  started_at: string
  elapsed_seconds: number
  description: string | null
  client_id: number | null
  engagement_id: number | null
  project_id: number | null
  task: string | null
  billable: boolean
}

export interface StartTimerPayload {
  description?: string
  client_id?: number
  engagement_id?: number
  project_id?: number
  task?: string
  billable?: boolean
}

// ---- time billing ----
export interface TimeBillingPreview {
  total_hours: number
  total_amount: number
  entries: Array<{
    date: string
    hours: number
    task: string | null
    billable: boolean
    timesheet_id: number
    entry_id: number
  }>
}

export interface TimeBillingGeneratePayload {
  client_id: number
  from_date: string
  to_date: string
  hourly_rate: number
  description_template?: string
  create_invoice?: boolean
}

function toQuery(p: Record<string, unknown>): string {
  const q = new URLSearchParams()
  for (const [k, v] of Object.entries(p)) {
    if (v === '' || v == null) continue
    q.set(k, String(v))
  }
  return q.toString() ? `?${q}` : ''
}

export function timesheetService() {
  const api = useApi()

  return {
    summary: (params: { employee_id?: number; week_start?: string; week_end?: string; status?: TimesheetStatus } = {}) =>
      api.get<ItemResponse<TimesheetSummary>>(`${ENDPOINTS.timesheets.summary}${toQuery(params)}`).then(r => r.data),

    list: (params: TimesheetListParams = {}) =>
      api.get<ListResponse<Timesheet>>(`${ENDPOINTS.timesheets.list}${toQuery(params)}`),
    get: (id: number) =>
      api.get<ItemResponse<Timesheet>>(ENDPOINTS.timesheets.one(id)).then(r => r.data),
    create: (form: TimesheetForm, idempotencyKey?: string) =>
      api.post<ItemResponse<Timesheet>>(ENDPOINTS.timesheets.list, form, { idempotencyKey }).then(r => r.data),
    update: (id: number, form: Partial<TimesheetForm>) =>
      api.put<ItemResponse<Timesheet>>(ENDPOINTS.timesheets.one(id), form).then(r => r.data),
    remove: (id: number) =>
      api.delete<void>(ENDPOINTS.timesheets.one(id)),

    submit: (id: number, idempotencyKey?: string) =>
      api.post<ItemResponse<Timesheet>>(ENDPOINTS.timesheets.submit(id), undefined, { idempotencyKey }).then(r => r.data),
    approve: (id: number, payload: { notes?: string } = {}, idempotencyKey?: string) =>
      api.post<ItemResponse<Timesheet>>(ENDPOINTS.timesheets.approve(id), payload, { idempotencyKey }).then(r => r.data),
    reject: (id: number, reason: string, idempotencyKey?: string) =>
      api.post<ItemResponse<Timesheet>>(ENDPOINTS.timesheets.reject(id), { reason }, { idempotencyKey }).then(r => r.data),

    bulkApprove: (ids: number[], idempotencyKey?: string) =>
      api.post<{ data: { approved: number } }>(ENDPOINTS.timesheets.bulkApprove, { timesheet_ids: ids }, { idempotencyKey }),
    bulkSubmit: (ids: number[], idempotencyKey?: string) =>
      api.post<{ data: { submitted: number } }>(ENDPOINTS.timesheets.bulkSubmit, { timesheet_ids: ids }, { idempotencyKey }),
  }
}

export function timerService() {
  const api = useApi()
  return {
    start: (payload: StartTimerPayload = {}, idempotencyKey?: string) =>
      api.post<ItemResponse<RunningTimer>>(ENDPOINTS.timers.start, payload, { idempotencyKey }).then(r => r.data),
    current: () =>
      api.get<ItemResponse<RunningTimer | null>>(ENDPOINTS.timers.current).then(r => r.data),
    stop: (id: number, payload: { timesheet_id?: number } = {}, idempotencyKey?: string) =>
      api.post<ItemResponse<TimesheetEntry>>(ENDPOINTS.timers.stop(id), payload, { idempotencyKey }).then(r => r.data),
    discard: (id: number) =>
      api.delete<void>(ENDPOINTS.timers.remove(id)),
  }
}

export function timeBillingService() {
  const api = useApi()
  return {
    preview: (params: { client_id: number; from_date?: string; to_date?: string }) =>
      api.get<ItemResponse<TimeBillingPreview>>(`${ENDPOINTS.timeBilling.preview}${toQuery(params)}`).then(r => r.data),
    generate: (payload: TimeBillingGeneratePayload, idempotencyKey: string) =>
      api.post<ItemResponse<{ invoice_id: number }>>(ENDPOINTS.timeBilling.generate, payload, { idempotencyKey }).then(r => r.data),
  }
}
