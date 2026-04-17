export function useBlog() {
  const api = useApi()

  // Public
  async function getPosts(params?: { page?: number; category?: string; tag?: string; search?: string }) {
    const q = new URLSearchParams()
    if (params?.page) q.set('page', String(params.page))
    if (params?.category) q.set('category', params.category)
    if (params?.tag) q.set('tag', params.tag)
    if (params?.search) q.set('search', params.search)
    const qs = q.toString()
    return api.get<PaginatedBlogPosts>(`/blog${qs ? `?${qs}` : ''}`)
  }

  async function getPost(slug: string) {
    try {
      const res = await api.get<{ data: BlogPost }>(`/blog/${slug}`)
      return res.data
    } catch { return null }
  }

  async function getFeatured() {
    try {
      const res = await api.get<{ data: BlogPost[] }>('/blog/featured')
      return res.data
    } catch { return [] }
  }

  async function getCategories() {
    try {
      const res = await api.get<{ data: BlogCategory[] }>('/blog/categories')
      return res.data
    } catch { return [] }
  }

  async function getTags() {
    try {
      const res = await api.get<{ data: BlogTag[] }>('/blog/tags')
      return res.data
    } catch { return [] }
  }

  // Admin
  async function getAdminPosts(params?: { page?: number; search?: string }) {
    const q = new URLSearchParams()
    if (params?.page) q.set('page', String(params.page))
    if (params?.search) q.set('search', params.search)
    return api.get<PaginatedBlogPosts>(`/admin/blog/posts?${q.toString()}`)
  }
  async function getAdminPost(id: number) { return api.get<{ data: BlogPost }>(`/admin/blog/posts/${id}`) }
  async function createPost(data: any) { return api.post<{ data: BlogPost }>('/admin/blog/posts', data) }
  async function updatePost(id: number, data: any) { return api.put<{ data: BlogPost }>(`/admin/blog/posts/${id}`, data) }
  async function deletePost(id: number) { return api.delete(`/admin/blog/posts/${id}`) }

  async function getAdminCategories() { return api.get<{ data: BlogCategory[] }>('/admin/blog/categories') }
  async function createCategory(data: any) { return api.post('/admin/blog/categories', data) }
  async function updateCategory(id: number, data: any) { return api.put(`/admin/blog/categories/${id}`, data) }
  async function deleteCategory(id: number) { return api.delete(`/admin/blog/categories/${id}`) }

  async function getAdminTags() { return api.get<{ data: BlogTag[] }>('/admin/blog/tags') }
  async function createTag(data: any) { return api.post('/admin/blog/tags', data) }
  async function deleteTag(id: number) { return api.delete(`/admin/blog/tags/${id}`) }

  return {
    getPosts, getPost, getFeatured, getCategories, getTags,
    getAdminPosts, getAdminPost, createPost, updatePost, deletePost,
    getAdminCategories, createCategory, updateCategory, deleteCategory,
    getAdminTags, createTag, deleteTag,
  }
}

export interface BlogPost {
  id: number
  slug: string
  title: { ar: string; en: string }
  excerpt: { ar: string; en: string }
  content: { ar: string; en: string }
  cover_image: string | null
  meta_description: { ar: string; en: string }
  author_name: string | null
  is_published: boolean
  is_featured: boolean
  published_at: string | null
  reading_time: number
  views_count: number
  category?: { id: number; slug: string; name: { ar: string; en: string } }
  tags?: { id: number; slug: string; name: { ar: string; en: string } }[]
}

export interface BlogCategory {
  id: number
  slug: string
  name: { ar: string; en: string }
  description: { ar: string; en: string }
  posts_count?: number
}

export interface BlogTag {
  id: number
  slug: string
  name: { ar: string; en: string }
  posts_count?: number
}

export interface PaginatedBlogPosts {
  data: BlogPost[]
  meta: { current_page: number; last_page: number; total: number }
}
