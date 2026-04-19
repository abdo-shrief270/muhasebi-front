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

export interface ApprovalRequest {
  id: number
  entity_type: ApprovableEntity
  entity_id: number
  workflow_id: number | null
  status: ApprovalStatus
  current_step: number | null
  submitted_by: number
  submitted_at: string
  approvals: Array<{
    step: number
    approver_id: number
    decision: 'approved' | 'rejected'
    comment: string | null
    acted_at: string
  }>
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

    pending: (params: BaseListParams = {}) =>
      api.get<ListResponse<ApprovalRequest>>(`${ENDPOINTS.approvals.pending}${toQuery(params)}`),
    history: (params: BaseListParams & { entity_type?: ApprovableEntity; status?: ApprovalStatus } = {}) =>
      api.get<ListResponse<ApprovalRequest>>(`${ENDPOINTS.approvals.history}${toQuery(params)}`),
  }
}
