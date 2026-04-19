import { ENDPOINTS } from '~/core/api/endpoints'
import type { BaseListParams, ListResponse, ItemResponse } from '~/shared/types/common'
import type { BilingualText } from '~/features/marketing/services/marketingService'

/**
 * Real shape verified against `GET /api/v1/blog` on 2026-04-19.
 * All user-facing text fields are bilingual (`{ ar, en }`), never plain strings.
 */
export interface BlogPost {
  id: number
  slug: string
  title: BilingualText
  excerpt: BilingualText
  content: BilingualText
  cover_image: string | null
  meta_description: BilingualText
  author_name: string | null
  is_published: boolean
  is_featured: boolean
  published_at: string | null
  reading_time: number
  views_count: number
  category?: BlogCategory
  tags?: BlogTag[]
  created_at?: string
  updated_at?: string
}

export interface BlogCategory {
  id: number
  slug: string
  name: BilingualText
  description?: BilingualText
  posts_count?: number
}

export interface BlogTag {
  id: number
  slug: string
  name: BilingualText
  posts_count?: number
}

export interface BlogListParams extends BaseListParams {
  category?: string
  tag?: string
}

function toQuery(p: Record<string, unknown>): string {
  const q = new URLSearchParams()
  for (const [k, v] of Object.entries(p)) {
    if (v === '' || v == null) continue
    q.set(k, String(v))
  }
  return q.toString() ? `?${q}` : ''
}

export function blogService() {
  const api = useApi()

  return {
    list: (params: BlogListParams = {}) =>
      api.get<ListResponse<BlogPost>>(`${ENDPOINTS.public.blog.list}${toQuery(params)}`),
    post: (slug: string) =>
      api.get<ItemResponse<BlogPost>>(ENDPOINTS.public.blog.post(slug)).then(r => r.data),
    featured: () =>
      api.get<{ data: BlogPost[] }>(ENDPOINTS.public.blog.featured).then(r => r.data),
    categories: () =>
      api.get<{ data: BlogCategory[] }>(ENDPOINTS.public.blog.categories).then(r => r.data),
    tags: () =>
      api.get<{ data: BlogTag[] }>(ENDPOINTS.public.blog.tags).then(r => r.data),
    search: (q: string) =>
      api.get<ListResponse<BlogPost>>(`${ENDPOINTS.public.blog.search}?q=${encodeURIComponent(q)}`),
    rss: () => api.raw<string>(ENDPOINTS.public.blog.rss, { responseType: 'text' }),
  }
}
