import { z } from 'zod'
import {
  dateField, numericPositive, numericNonNeg, optionalTrimmed, optionalEmail,
  optionalPhone, egyptianNationalId,
} from '~/shared/utils/zod-helpers'

export const employmentTypes = ['full_time', 'part_time', 'contractor', 'intern'] as const
export const genders = ['male', 'female'] as const
export const maritalStatuses = ['single', 'married', 'divorced', 'widowed'] as const

export const employeeFormSchema = z.object({
  first_name: z.string().trim().min(2, 'First name is required').max(120),
  last_name: z.string().trim().min(2, 'Last name is required').max(120),
  national_id: egyptianNationalId,
  email: optionalEmail,
  phone: optionalPhone,
  hire_date: dateField,
  job_title: z.string().trim().min(2, 'Job title is required').max(200),
  department: optionalTrimmed,
  cost_center_id: z.number().int().positive().optional().nullable(),
  employment_type: z.enum(employmentTypes).default('full_time'),
  basic_salary: numericPositive,
  currency: z.string().trim().toUpperCase().length(3).default('EGP'),
  bank_name: optionalTrimmed,
  bank_account: optionalTrimmed,
  social_insurance_number: optionalTrimmed,
  tax_number: optionalTrimmed,
  address: optionalTrimmed,
  date_of_birth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format').optional().nullable(),
  gender: z.enum(genders).optional().nullable(),
  marital_status: z.enum(maritalStatuses).optional().nullable(),
  dependents: z.number().int().min(0).optional().nullable(),
})

export type EmployeeFormInput = z.input<typeof employeeFormSchema>
export type EmployeeFormOutput = z.output<typeof employeeFormSchema>

export const employeeFormDefaults: EmployeeFormInput = {
  first_name: '',
  last_name: '',
  national_id: '',
  email: '',
  phone: '',
  hire_date: new Date().toISOString().slice(0, 10),
  job_title: '',
  department: '',
  employment_type: 'full_time',
  basic_salary: 0,
  currency: 'EGP',
  bank_name: '',
  bank_account: '',
  social_insurance_number: '',
  tax_number: '',
  address: '',
}

export const leaveRequestFormSchema = z
  .object({
    employee_id: z.number({ message: 'Employee is required' }).int().positive('Employee is required'),
    leave_type_id: z.number({ message: 'Leave type is required' }).int().positive('Leave type is required'),
    from_date: dateField,
    to_date: dateField,
    days: numericPositive,
    reason: optionalTrimmed,
    attachments: z.array(z.number().int().positive()).default([]),
  })
  .refine(
    v => new Date(v.to_date) >= new Date(v.from_date),
    { message: 'End date cannot be before start date', path: ['to_date'] },
  )

export type LeaveRequestFormInput = z.input<typeof leaveRequestFormSchema>

export const leaveRequestFormDefaults: LeaveRequestFormInput = {
  employee_id: 0,
  leave_type_id: 0,
  from_date: new Date().toISOString().slice(0, 10),
  to_date: new Date().toISOString().slice(0, 10),
  days: 1,
  reason: '',
  attachments: [],
}

export const loanFormSchema = z.object({
  employee_id: z.number({ message: 'Employee is required' }).int().positive('Employee is required'),
  amount: numericPositive,
  interest_rate: numericNonNeg.default(0),
  start_date: dateField,
  installments: z.number().int().min(1, 'At least 1 installment').max(120, 'Too many installments'),
  frequency: z.enum(['monthly']).default('monthly'),
  notes: optionalTrimmed,
})

export type LoanFormInput = z.input<typeof loanFormSchema>
