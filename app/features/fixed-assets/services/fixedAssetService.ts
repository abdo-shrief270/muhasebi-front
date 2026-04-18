import { ENDPOINTS } from '~/core/api/endpoints'
import type { BaseListParams, ItemResponse, ListResponse } from '~/shared/types/common'

export type DepreciationMethod = 'straight_line' | 'declining_balance' | 'units_of_production'
export type FixedAssetStatus = 'active' | 'disposed' | 'fully_depreciated'

export interface AssetCategory {
  id: number
  name: string
  name_ar: string
  useful_life_years: number
  salvage_rate: number
  depreciation_method: DepreciationMethod
  asset_account_id: number
  accumulated_depreciation_account_id: number
  depreciation_expense_account_id: number
}

export type AssetCategoryForm = Omit<AssetCategory, 'id'>

export interface FixedAsset {
  id: number
  category_id: number
  name: string
  asset_number: string
  description: string | null
  acquisition_date: string
  cost: number
  currency: string
  useful_life_years: number
  salvage_value: number
  depreciation_method: DepreciationMethod
  in_service_date: string
  location: string | null
  custodian_id: number | null
  vendor_id: number | null
  invoice_reference: string | null
  cost_center_id: number | null
  accumulated_depreciation: number
  book_value: number
  status: FixedAssetStatus
  created_at: string
}

export interface FixedAssetDetail extends FixedAsset {
  depreciation_schedule: Array<{
    period: string
    amount: number
    posted: boolean
    posted_at?: string
  }>
}

export type FixedAssetForm = Omit<FixedAsset, 'id' | 'accumulated_depreciation' | 'book_value' | 'status' | 'asset_number' | 'created_at'> & {
  asset_number?: string
}

export interface FixedAssetListParams extends BaseListParams {
  category_id?: number
  status?: FixedAssetStatus
}

export interface DepreciationRunPayload {
  period_end: string
  asset_ids?: number[]
}

export interface AssetDisposal {
  id: number
  fixed_asset_id: number
  disposal_date: string
  method: 'sale' | 'scrap' | 'donation' | 'trade_in'
  proceeds: number
  buyer_id: number | null
  account_id: number
  gain_loss: number
  notes: string | null
  created_at: string
}

export interface DisposePayload {
  disposal_date: string
  method: AssetDisposal['method']
  proceeds?: number
  buyer_id?: number
  account_id: number
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

export function assetCategoryService() {
  const api = useApi()

  return {
    list: () =>
      api.get<{ data: AssetCategory[] }>(ENDPOINTS.assetCategories.list).then(r => r.data),
    get: (id: number) =>
      api.get<ItemResponse<AssetCategory>>(ENDPOINTS.assetCategories.one(id)).then(r => r.data),
    create: (form: AssetCategoryForm, idempotencyKey?: string) =>
      api.post<ItemResponse<AssetCategory>>(ENDPOINTS.assetCategories.list, form, { idempotencyKey }).then(r => r.data),
    update: (id: number, form: Partial<AssetCategoryForm>) =>
      api.put<ItemResponse<AssetCategory>>(ENDPOINTS.assetCategories.one(id), form).then(r => r.data),
    remove: (id: number) =>
      api.delete<void>(ENDPOINTS.assetCategories.one(id)),
  }
}

export function fixedAssetService() {
  const api = useApi()

  return {
    list: (params: FixedAssetListParams = {}) =>
      api.get<ListResponse<FixedAsset>>(`${ENDPOINTS.fixedAssets.list}${toQuery(params)}`),
    get: (id: number) =>
      api.get<ItemResponse<FixedAssetDetail>>(ENDPOINTS.fixedAssets.one(id)).then(r => r.data),
    create: (form: FixedAssetForm, idempotencyKey?: string) =>
      api.post<ItemResponse<FixedAsset>>(ENDPOINTS.fixedAssets.list, form, { idempotencyKey }).then(r => r.data),
    update: (id: number, form: Partial<FixedAssetForm>) =>
      api.put<ItemResponse<FixedAsset>>(ENDPOINTS.fixedAssets.one(id), form).then(r => r.data),
    remove: (id: number) =>
      api.delete<void>(ENDPOINTS.fixedAssets.one(id)),

    depreciationSchedule: (id: number) =>
      api.get<{ data: FixedAssetDetail['depreciation_schedule'] }>(
        ENDPOINTS.fixedAssets.depreciationSchedule(id),
      ).then(r => r.data),
    depreciate: (payload: DepreciationRunPayload, idempotencyKey: string) =>
      api.post<{ data: { assets_processed: number; journal_entry_id: number } }>(
        ENDPOINTS.fixedAssets.depreciate, payload, { idempotencyKey },
      ),

    register: (q: { as_of_date?: string; format?: 'json' | 'csv' | 'pdf' } = {}) =>
      api.get(`${ENDPOINTS.fixedAssets.register}${toQuery(q)}`),
    rollForward: (q: { from_date?: string; to_date?: string } = {}) =>
      api.get(`${ENDPOINTS.fixedAssets.rollForward}${toQuery(q)}`),

    disposals: (id: number) =>
      api.get<{ data: AssetDisposal[] }>(ENDPOINTS.fixedAssets.disposals(id)).then(r => r.data),
    dispose: (id: number, payload: DisposePayload, idempotencyKey: string) =>
      api.post<ItemResponse<AssetDisposal>>(
        ENDPOINTS.fixedAssets.dispose(id), payload, { idempotencyKey },
      ).then(r => r.data),
  }
}
