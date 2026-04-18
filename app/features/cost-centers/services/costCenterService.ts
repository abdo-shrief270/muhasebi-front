import { ENDPOINTS } from '~/core/api/endpoints'
import type { BaseListParams, ItemResponse, ListResponse } from '~/shared/types/common'

export type CostCenterType = 'department' | 'project' | 'location' | 'division'

export interface CostCenter {
  id: number
  code: string
  name_en: string
  name_ar: string
  parent_id: number | null
  description: string | null
  manager_id: number | null
  type: CostCenterType | null
  active: boolean
  children?: CostCenter[]
}

export type CostCenterForm = Omit<CostCenter, 'id' | 'children'>

export interface CostCenterListParams extends BaseListParams {
  parent_id?: number
  manager_id?: number
  active?: boolean
}

export interface CostCenterPnl {
  revenue: number
  expenses: number
  contribution: number
  margin_percent: number
  line_items: Array<{ account: string; amount: number }>
}

export interface CostAnalysisRow {
  key: string
  label: string
  total: number
  components: Record<string, number>
}

export interface AllocationReportRow {
  cost_center_id: number
  name: string
  direct: number
  allocated: number
  total: number
}

function toQuery(p: Record<string, unknown>): string {
  const q = new URLSearchParams()
  for (const [k, v] of Object.entries(p)) {
    if (v === '' || v == null) continue
    q.set(k, String(v))
  }
  return q.toString() ? `?${q}` : ''
}

export function costCenterService() {
  const api = useApi()

  return {
    list: (params: CostCenterListParams = {}) =>
      api.get<ListResponse<CostCenter>>(`${ENDPOINTS.costCenters.list}${toQuery(params)}`),
    get: (id: number) =>
      api.get<ItemResponse<CostCenter>>(ENDPOINTS.costCenters.one(id)).then(r => r.data),
    create: (form: CostCenterForm, idempotencyKey?: string) =>
      api.post<ItemResponse<CostCenter>>(ENDPOINTS.costCenters.list, form, { idempotencyKey }).then(r => r.data),
    update: (id: number, form: Partial<CostCenterForm>) =>
      api.put<ItemResponse<CostCenter>>(ENDPOINTS.costCenters.one(id), form).then(r => r.data),
    remove: (id: number) =>
      api.delete<void>(ENDPOINTS.costCenters.one(id)),

    pnl: (id: number, params: { from_date?: string; to_date?: string; include_children?: boolean } = {}) =>
      api.get<ItemResponse<CostCenterPnl>>(`${ENDPOINTS.costCenters.pnl(id)}${toQuery(params)}`).then(r => r.data),
    costAnalysis: (params: { from_date?: string; to_date?: string; group_by?: 'account' | 'cost_center' | 'month' } = {}) =>
      api.get<{ data: CostAnalysisRow[] }>(`${ENDPOINTS.costCenters.costAnalysis}${toQuery(params)}`).then(r => r.data),
    allocation: (params: { from_date?: string; to_date?: string } = {}) =>
      api.get<{ data: AllocationReportRow[] }>(`${ENDPOINTS.costCenters.allocation}${toQuery(params)}`).then(r => r.data),
  }
}
