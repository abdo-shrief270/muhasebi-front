export interface Account {
  id: number
  code: string
  name_ar: string
  name_en: string
  type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense'
  normal_balance: 'debit' | 'credit'
  parent_id: number | null
  is_group: boolean
  is_active: boolean
  level: number
  currency: string
  children?: Account[]
}

export interface JournalEntry {
  id: number
  entry_number: string
  date: string
  description: string
  reference: string | null
  status: 'draft' | 'posted' | 'reversed'
  total_debit: string
  total_credit: string
  posted_at: string | null
  reversed_at: string | null
  created_at: string
  lines?: JournalEntryLine[]
  created_by_user?: { id: number; name: string }
}

export interface JournalEntryLine {
  id: number
  account_id: number
  debit: string
  credit: string
  description: string | null
  account?: Account
}

export interface JournalEntryForm {
  date: string
  description: string
  reference: string
  lines: { account_id: number | null; debit: string; credit: string; description: string }[]
}

export interface FiscalYear {
  id: number
  name: string
  start_date: string
  end_date: string
  is_closed: boolean
  periods?: FiscalPeriod[]
}

export interface FiscalPeriod {
  id: number
  period_number: number
  start_date: string
  end_date: string
  is_closed: boolean
}

export interface TrialBalanceRow {
  account_id: number
  code: string
  name_ar: string
  name_en: string
  type: string
  debit: number
  credit: number
  balance: number
}

export interface LedgerEntry {
  date: string
  entry_number: string
  description: string
  debit: number
  credit: number
  balance: number
}
