import { describe, it, expect } from 'vitest'
import { employeeFormSchema, leaveRequestFormSchema, loanFormSchema } from '~/features/payroll/schemas'

const validEmployee = {
  first_name: 'Abdelrahman',
  last_name: 'Shreef',
  national_id: '29001011234567',
  email: 'abdo@example.com',
  phone: '+201001234567',
  hire_date: '2024-01-01',
  job_title: 'Senior Accountant',
  department: 'Finance',
  employment_type: 'full_time' as const,
  basic_salary: 15000,
  currency: 'EGP',
  bank_name: '',
  bank_account: '',
  social_insurance_number: '',
  tax_number: '',
  address: '',
}

describe('employeeFormSchema', () => {
  it('accepts a valid employee', () => {
    expect(employeeFormSchema.safeParse(validEmployee).success).toBe(true)
  })

  it('rejects short first name', () => {
    expect(employeeFormSchema.safeParse({ ...validEmployee, first_name: 'A' }).success).toBe(false)
  })

  it('rejects bad national ID (wrong length)', () => {
    expect(employeeFormSchema.safeParse({ ...validEmployee, national_id: '123' }).success).toBe(false)
  })

  it('accepts blank national ID', () => {
    expect(employeeFormSchema.safeParse({ ...validEmployee, national_id: '' }).success).toBe(true)
  })

  it('rejects zero or negative salary', () => {
    expect(employeeFormSchema.safeParse({ ...validEmployee, basic_salary: 0 }).success).toBe(false)
    expect(employeeFormSchema.safeParse({ ...validEmployee, basic_salary: -100 }).success).toBe(false)
  })

  it('rejects bad email', () => {
    expect(employeeFormSchema.safeParse({ ...validEmployee, email: 'not-an-email' }).success).toBe(false)
  })
})

describe('leaveRequestFormSchema', () => {
  const base = {
    employee_id: 1,
    leave_type_id: 1,
    from_date: '2026-04-18',
    to_date: '2026-04-20',
    days: 3,
    reason: 'Family trip',
    attachments: [],
  }

  it('accepts a valid request', () => {
    expect(leaveRequestFormSchema.safeParse(base).success).toBe(true)
  })

  it('rejects to_date before from_date', () => {
    expect(leaveRequestFormSchema.safeParse({ ...base, to_date: '2026-04-01' }).success).toBe(false)
  })

  it('rejects missing employee_id', () => {
    expect(leaveRequestFormSchema.safeParse({ ...base, employee_id: 0 }).success).toBe(false)
  })

  it('rejects zero days', () => {
    expect(leaveRequestFormSchema.safeParse({ ...base, days: 0 }).success).toBe(false)
  })
})

describe('loanFormSchema', () => {
  const base = {
    employee_id: 1,
    amount: 10000,
    interest_rate: 0,
    start_date: '2026-04-18',
    installments: 12,
    frequency: 'monthly' as const,
    notes: '',
  }

  it('accepts a valid loan', () => {
    expect(loanFormSchema.safeParse(base).success).toBe(true)
  })

  it('rejects 0 installments', () => {
    expect(loanFormSchema.safeParse({ ...base, installments: 0 }).success).toBe(false)
  })

  it('rejects >120 installments', () => {
    expect(loanFormSchema.safeParse({ ...base, installments: 200 }).success).toBe(false)
  })
})
