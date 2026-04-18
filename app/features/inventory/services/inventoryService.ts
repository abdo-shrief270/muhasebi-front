import { ENDPOINTS } from '~/core/api/endpoints'
import type { BaseListParams, ItemResponse, ListResponse } from '~/shared/types/common'

export type ValuationMethod = 'fifo' | 'lifo' | 'weighted_average'
export type MovementType = 'in' | 'out' | 'adjustment' | 'transfer'

// ----- categories -----
export interface ProductCategory {
  id: number
  name: string
  description: string | null
}

export type ProductCategoryForm = Omit<ProductCategory, 'id'>

// ----- products -----
export interface Product {
  id: number
  category_id: number | null
  sku: string
  barcode: string | null
  name_en: string | null
  name_ar: string
  description: string | null
  unit: string
  cost_price: number
  selling_price: number
  tax_rate: number
  reorder_level: number | null
  reorder_quantity: number | null
  valuation_method: ValuationMethod
  track_stock: boolean
  inventory_account_id: number | null
  cogs_account_id: number | null
  revenue_account_id: number | null
  eta_item_code: string | null
  eta_item_code_type: string | null
  current_stock: number
  unit_cost: number
  low_stock_alert: boolean
  last_movement_at: string | null
}

export type ProductForm = Partial<Omit<Product, 'id' | 'current_stock' | 'unit_cost' | 'low_stock_alert' | 'last_movement_at'>> & {
  sku: string
  name_ar: string
  unit: string
  cost_price: number
  selling_price: number
}

export interface ProductListParams extends BaseListParams {
  category_id?: number
  low_stock_only?: boolean
}

// ----- movements -----
export interface StockMovement {
  id: number
  product_id: number
  type: MovementType
  quantity: number
  unit_cost: number | null
  reference: string | null
  reference_type: string | null
  reference_id: number | null
  date: string
  location_from: string | null
  location_to: string | null
  notes: string | null
  created_at: string
  created_by: { id: number; name: string } | null
}

export interface StockMovementForm {
  product_id: number
  type: MovementType
  quantity: number
  unit_cost?: number
  reference?: string
  reference_type?: string
  reference_id?: number
  date: string
  location_from?: string
  location_to?: string
  notes?: string
}

// ----- reports -----
export interface StockReportRow {
  product_id: number
  sku: string
  name_ar: string
  name_en: string | null
  current_stock: number
  unit_cost: number
  value: number
  reorder_level: number | null
}

export interface ValuationRow {
  product_id: number
  sku: string
  name_ar: string
  quantity: number
  method: ValuationMethod
  unit_cost: number
  total_value: number
}

export interface TurnoverRow {
  product_id: number
  sku: string
  name_ar: string
  units_sold: number
  cogs: number
  avg_inventory: number
  turnover_ratio: number
  days_of_inventory: number
}

function toQuery(p: Record<string, unknown>): string {
  const q = new URLSearchParams()
  for (const [k, v] of Object.entries(p)) {
    if (v === '' || v == null) continue
    q.set(k, String(v))
  }
  return q.toString() ? `?${q}` : ''
}

export function productCategoryService() {
  const api = useApi()

  return {
    list: () =>
      api.get<{ data: ProductCategory[] }>(ENDPOINTS.productCategories.list).then(r => r.data),
    create: (form: ProductCategoryForm, idempotencyKey?: string) =>
      api.post<ItemResponse<ProductCategory>>(ENDPOINTS.productCategories.list, form, { idempotencyKey }).then(r => r.data),
    update: (id: number, form: Partial<ProductCategoryForm>) =>
      api.put<ItemResponse<ProductCategory>>(ENDPOINTS.productCategories.one(id), form).then(r => r.data),
    remove: (id: number) =>
      api.delete<void>(ENDPOINTS.productCategories.one(id)),
  }
}

export function productService() {
  const api = useApi()

  return {
    list: (params: ProductListParams = {}) =>
      api.get<ListResponse<Product>>(`${ENDPOINTS.products.list}${toQuery(params)}`),
    get: (id: number) =>
      api.get<ItemResponse<Product>>(ENDPOINTS.products.one(id)).then(r => r.data),
    create: (form: ProductForm, idempotencyKey?: string) =>
      api.post<ItemResponse<Product>>(ENDPOINTS.products.list, form, { idempotencyKey }).then(r => r.data),
    update: (id: number, form: Partial<ProductForm>) =>
      api.put<ItemResponse<Product>>(ENDPOINTS.products.one(id), form).then(r => r.data),
    remove: (id: number) =>
      api.delete<void>(ENDPOINTS.products.one(id)),

    movements: (id: number, params: BaseListParams = {}) =>
      api.get<ListResponse<StockMovement>>(`${ENDPOINTS.products.movements(id)}${toQuery(params)}`),
  }
}

export function inventoryService() {
  const api = useApi()

  return {
    recordMovement: (form: StockMovementForm, idempotencyKey: string) =>
      api.post<ItemResponse<StockMovement>>(ENDPOINTS.inventory.movements, form, { idempotencyKey }).then(r => r.data),

    stockReport: (params: { as_of_date?: string; category_id?: number; location?: string; format?: 'json' | 'csv' } = {}) =>
      api.get<{ data: StockReportRow[] }>(`${ENDPOINTS.inventory.stockReport}${toQuery(params)}`).then(r => r.data),
    lowStock: () =>
      api.get<{ data: Product[] }>(ENDPOINTS.inventory.lowStock).then(r => r.data),
    valuation: (params: { method?: ValuationMethod; as_of_date?: string } = {}) =>
      api.get<{ data: { rows: ValuationRow[]; total: number } }>(`${ENDPOINTS.inventory.valuation}${toQuery(params)}`).then(r => r.data),
    turnover: (params: { from_date?: string; to_date?: string } = {}) =>
      api.get<{ data: TurnoverRow[] }>(`${ENDPOINTS.inventory.turnover}${toQuery(params)}`).then(r => r.data),
  }
}
