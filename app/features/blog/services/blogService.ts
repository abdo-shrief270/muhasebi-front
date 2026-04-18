import { ENDPOINTS } from '~/core/api/endpoints'
import type { BaseListParams, ListResponse, ItemResponse } from '~/shared/types/common'

export interface BlogPost {
  id: number
  slug: string
  title: string
  excerpt: string
  content: string
  cover_image: string | null
  meta_description: string | null
  author_name: string | null
  is_published: boolean
  is_featured: boolean
  published_at: string | null
  reading_time: number
  views_count: number
  category?: BlogCategory
  tags?: BlogTag[]
}

export interface BlogCategory {
  id: number
  slug: string
  name: string
  description?: string
  posts_count?: number
}

export interface BlogTag {
  id: number
  slug: string
  name: string
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
