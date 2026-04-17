export interface Document {
  id: number
  name: string
  description: string | null
  mime_type: string
  size_bytes: number
  category: string | null
  client_id: number | null
  is_archived: boolean
  created_at: string
  client?: { id: number; name: string }
  uploaded_by_user?: { id: number; name: string }
}
