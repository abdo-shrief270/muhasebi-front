import { ENDPOINTS } from '~/core/api/endpoints'
import type { BaseListParams, ItemResponse, ListResponse } from '~/shared/types/common'

export type TenantRole = 'tenant_admin' | 'accountant' | 'manager' | 'employee' | 'viewer' | string

export interface TeamMember {
  id: number
  name: string
  email: string
  phone: string | null
  role: TenantRole
  is_active: boolean
  last_login_at: string | null
  two_factor_enabled: boolean
  created_at: string
}

export interface InvitePayload {
  email: string
  name: string
  role: TenantRole
  send_email?: boolean
}

export interface InviteResult {
  data: TeamMember
  invitation_url?: string
}

export interface UpdateMemberPayload {
  name?: string
  phone?: string
}

export interface TeamListParams extends BaseListParams {
  status?: 'active' | 'inactive'
  role?: TenantRole
}

function toQuery(p: Record<string, unknown>): string {
  const q = new URLSearchParams()
  for (const [k, v] of Object.entries(p)) {
    if (v === '' || v == null) continue
    q.set(k, String(v))
  }
  return q.toString() ? `?${q}` : ''
}

export function teamService() {
  const api = useApi()

  return {
    list: (params: TeamListParams = {}) =>
      api.get<ListResponse<TeamMember>>(`${ENDPOINTS.team.list}${toQuery(params)}`),
    invite: (payload: InvitePayload, idempotencyKey?: string) =>
      api.post<InviteResult>(ENDPOINTS.team.invite, payload, { idempotencyKey }),
    update: (id: number, payload: UpdateMemberPayload) =>
      api.put<ItemResponse<TeamMember>>(ENDPOINTS.team.one(id), payload).then(r => r.data),
    toggleActive: (id: number) =>
      api.patch<ItemResponse<TeamMember>>(ENDPOINTS.team.toggleActive(id)).then(r => r.data),
    remove: (id: number) =>
      api.delete<void>(ENDPOINTS.team.one(id)),
    changeRole: (id: number, role: TenantRole) =>
      api.put<ItemResponse<TeamMember>>(ENDPOINTS.team.role(id), { role }).then(r => r.data),
  }
}
