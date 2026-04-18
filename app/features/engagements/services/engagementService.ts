import { ENDPOINTS } from '~/core/api/endpoints'
import type { BaseListParams, ItemResponse, ListResponse } from '~/shared/types/common'

export type EngagementStatus = 'planning' | 'active' | 'review' | 'completed' | 'archived'
export type ServiceType = 'audit' | 'review' | 'compilation' | 'tax' | 'advisory' | 'bookkeeping' | 'other'
export type DeliverableStatus = 'pending' | 'in_progress' | 'review' | 'completed'
export type WorkingPaperDecision = 'approved' | 'rework' | 'rejected'

export interface Engagement {
  id: number
  client_id: number
  title: string
  description: string | null
  service_type: ServiceType
  start_date: string
  end_date: string | null
  budget_hours: number | null
  budget_amount: number | null
  hourly_rate: number | null
  actual_hours: number
  actual_cost: number
  utilization_percent: number
  status: EngagementStatus
  partner_id: number | null
  manager_id: number | null
  team_ids: number[]
  client?: { id: number; name: string }
  created_at: string
}

export type EngagementForm = Partial<Omit<Engagement, 'id' | 'actual_hours' | 'actual_cost' | 'utilization_percent' | 'status' | 'client' | 'created_at'>> & {
  client_id: number
  title: string
  service_type: ServiceType
  start_date: string
}

export interface EngagementListParams extends BaseListParams {
  client_id?: number
  status?: EngagementStatus
  service_type?: ServiceType
}

export interface EngagementDashboard {
  active_count: number
  budget_utilization_percent: number
  overdue_deliverables: number
  billable_hours_month: number
  per_status: Record<EngagementStatus, number>
}

export interface TimeAllocation {
  by_member: Array<{ user_id: number; name: string; hours: number; cost: number }>
  by_phase: Array<{ phase: string; hours: number; cost: number }>
}

export interface Deliverable {
  id: number
  engagement_id: number
  title: string
  description: string | null
  due_date: string
  assigned_to: number | null
  status: DeliverableStatus
  attachments: number[]
  completed_at: string | null
}

export interface DeliverableForm {
  title: string
  description?: string
  due_date: string
  assigned_to?: number
  status?: DeliverableStatus
  attachments?: number[]
}

export interface WorkingPaper {
  id: number
  engagement_id: number
  title: string
  reference_number: string
  preparer_id: number
  reviewer_id: number | null
  description: string | null
  file_url: string | null
  tags: string[]
  decision: WorkingPaperDecision | null
  review_notes: string | null
  signed_off_at: string | null
  created_at: string
}

export interface WorkingPaperForm {
  title: string
  reference_number: string
  preparer_id: number
  description?: string
  tags?: string[]
}

export interface ReviewPayload {
  decision: WorkingPaperDecision
  notes?: string
  signed_off_at?: string
}

function toQuery(p: Record<string, unknown>): string {
  const q = new URLSearchParams()
  for (const [k, v] of Object.entries(p)) {
    if (v === '' || v == null) continue
    q.set(k, String(v))
  }
  return q.toString() ? `?${q}` : ''
}

export function engagementService() {
  const api = useApi()

  return {
    dashboard: () =>
      api.get<ItemResponse<EngagementDashboard>>(ENDPOINTS.engagements.dashboard).then(r => r.data),

    list: (params: EngagementListParams = {}) =>
      api.get<ListResponse<Engagement>>(`${ENDPOINTS.engagements.list}${toQuery(params)}`),
    get: (id: number) =>
      api.get<ItemResponse<Engagement>>(ENDPOINTS.engagements.one(id)).then(r => r.data),
    create: (form: EngagementForm, idempotencyKey?: string) =>
      api.post<ItemResponse<Engagement>>(ENDPOINTS.engagements.list, form, { idempotencyKey }).then(r => r.data),
    update: (id: number, form: Partial<EngagementForm>) =>
      api.put<ItemResponse<Engagement>>(ENDPOINTS.engagements.one(id), form).then(r => r.data),
    remove: (id: number) =>
      api.delete<void>(ENDPOINTS.engagements.one(id)),

    timeAllocation: (id: number) =>
      api.get<ItemResponse<TimeAllocation>>(ENDPOINTS.engagements.timeAllocation(id)).then(r => r.data),

    createDeliverable: (id: number, form: DeliverableForm, idempotencyKey?: string) =>
      api.post<ItemResponse<Deliverable>>(ENDPOINTS.engagements.deliverables(id), form, { idempotencyKey }).then(r => r.data),
    completeDeliverable: (id: number, deliverableId: number, payload: { notes?: string } = {}, idempotencyKey?: string) =>
      api.post<ItemResponse<Deliverable>>(
        ENDPOINTS.engagements.completeDeliverable(id, deliverableId), payload, { idempotencyKey },
      ).then(r => r.data),

    listWorkingPapers: (id: number, params: { status?: WorkingPaperDecision; preparer_id?: number; reviewer_id?: number } = {}) =>
      api.get<ListResponse<WorkingPaper>>(`${ENDPOINTS.engagements.workingPapers(id)}${toQuery(params)}`),
    createWorkingPaperJson: (id: number, form: WorkingPaperForm, idempotencyKey?: string) =>
      api.post<ItemResponse<WorkingPaper>>(ENDPOINTS.engagements.workingPapers(id), form, { idempotencyKey }).then(r => r.data),
    createWorkingPaperWithFile: (id: number, form: WorkingPaperForm, file: File, idempotencyKey?: string) => {
      const fd = new FormData()
      for (const [k, v] of Object.entries(form)) {
        if (v == null) continue
        if (Array.isArray(v)) v.forEach(x => fd.append(`${k}[]`, String(x)))
        else fd.append(k, String(v))
      }
      fd.append('file', file)
      const headers = api.getHeaders()
      delete (headers as any)['Content-Type']
      if (idempotencyKey) headers['Idempotency-Key'] = idempotencyKey
      return api.raw<ItemResponse<WorkingPaper>>(ENDPOINTS.engagements.workingPapers(id), {
        method: 'POST', body: fd, headers,
      })
    },
  }
}

export function workingPaperService() {
  const api = useApi()
  return {
    update: (id: number, form: Partial<WorkingPaperForm>) =>
      api.put<ItemResponse<WorkingPaper>>(ENDPOINTS.workingPapers.one(id), form).then(r => r.data),
    review: (id: number, payload: ReviewPayload, idempotencyKey?: string) =>
      api.post<ItemResponse<WorkingPaper>>(ENDPOINTS.workingPapers.review(id), payload, { idempotencyKey }).then(r => r.data),
  }
}
