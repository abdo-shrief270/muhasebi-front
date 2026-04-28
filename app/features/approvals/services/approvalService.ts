import { ENDPOINTS } from '~/core/api/endpoints'
import type { BaseListParams, ItemResponse, ListResponse } from '~/shared/types/common'

export type ApprovableEntity = 'bill' | 'expense' | 'journal_entry' | 'leave_request' | 'payroll_run'
export type ApprovalStatus = 'pending' | 'in_progress' | 'approved' | 'rejected' | 'timed_out'
export type ApproverType = 'user' | 'role' | 'manager'

export interface ApprovalStep {
  id?: number
  step_order: number
  approver_type: ApproverType
  approver_id: number | null
  approval_limit: number | null
  timeout_hours: number | null
}

export interface ApprovalWorkflow {
  id: number
  name_ar: string
  name_en: string | null
  entity_type: ApprovableEntity
  is_active: boolean
  steps_count?: number
  steps?: ApprovalStep[]
}

export interface ApprovalWorkflowForm {
  name_ar: string
  name_en?: string
  entity_type: ApprovableEntity
  is_active?: boolean
  steps: ApprovalStep[]
}

export interface ApprovalAction {
  step: number
  approver_id: number
  decision: 'approved' | 'rejected'
  comment: string | null
  acted_at: string
  actor?: { id: number; name: string } | null
}

export interface ApprovalRequest {
  id: number
  entity_type: ApprovableEntity
  entity_id: number
  workflow_id: number | null
  status: ApprovalStatus
  current_step: number | null
  submitted_by: number
  submitted_at: string
  amount?: number | null
  approvals: ApprovalAction[]
  // Eager-loaded by the controller — see ApprovalWorkflowService::listPending
  // (`with(['workflow', 'requester'])`) and listForEntity
  // (`with(['workflow', 'actions.actor', 'requester'])`).
  workflow?: Pick<ApprovalWorkflow, 'id' | 'name_ar' | 'name_en' | 'entity_type'> | null
  requester?: { id: number; name: string } | null
  actions?: ApprovalAction[]
}

export interface SubmitApprovalPayload {
  entity_type: ApprovableEntity
  entity_id: number
  amount: number
}

export interface WorkflowListParams extends BaseListParams {
  entity_type?: ApprovableEntity
  is_active?: boolean
}

function toQuery(p: Record<string, unknown>): string {
  const q = new URLSearchParams()
  for (const [k, v] of Object.entries(p)) {
    if (v === '' || v == null) continue
    q.set(k, String(v))
  }
  return q.toString() ? `?${q}` : ''
}

export function approvalWorkflowService() {
  const api = useApi()
  return {
    list: (params: WorkflowListParams = {}) =>
      api.get<ListResponse<ApprovalWorkflow>>(`${ENDPOINTS.approvalWorkflows.list}${toQuery(params)}`),
    get: (id: number) =>
      api.get<ItemResponse<ApprovalWorkflow>>(ENDPOINTS.approvalWorkflows.one(id)).then(r => r.data),
    create: (form: ApprovalWorkflowForm, idempotencyKey?: string) =>
      api.post<ItemResponse<ApprovalWorkflow>>(ENDPOINTS.approvalWorkflows.list, form, { idempotencyKey }).then(r => r.data),
    update: (id: number, form: ApprovalWorkflowForm) =>
      api.put<ItemResponse<ApprovalWorkflow>>(ENDPOINTS.approvalWorkflows.one(id), form).then(r => r.data),
    remove: (id: number) =>
      api.delete<void>(ENDPOINTS.approvalWorkflows.one(id)),
  }
}

export function approvalsService() {
  const api = useApi()
  return {
    submit: (payload: SubmitApprovalPayload, idempotencyKey?: string) =>
      api.post<ItemResponse<ApprovalRequest> | { message: string }>(
        ENDPOINTS.approvals.submit, payload, { idempotencyKey },
      ),
    approve: (id: number, comment?: string, idempotencyKey?: string) =>
      api.post<ItemResponse<ApprovalRequest>>(ENDPOINTS.approvals.approve(id), { comment }, { idempotencyKey }).then(r => r.data),
    reject: (id: number, comment: string, idempotencyKey?: string) =>
      api.post<ItemResponse<ApprovalRequest>>(ENDPOINTS.approvals.reject(id), { comment }, { idempotencyKey }).then(r => r.data),

    // NB: controller wraps the collection via ApiResponse::success so the
    // envelope is `{ message, data: ApprovalRequest[] }` — NOT the paginated
    // ListResponse shape. The backend also requires entity_type + entity_id
    // for history (it's per-entity, not a firm-wide feed).
    pending: () =>
      api.get<ItemResponse<ApprovalRequest[]>>(ENDPOINTS.approvals.pending).then(r => r.data),
    history: (params: { entity_type: ApprovableEntity; entity_id: number }) =>
      api.get<ItemResponse<ApprovalRequest[]>>(`${ENDPOINTS.approvals.history}${toQuery(params)}`).then(r => r.data),
  }
}
