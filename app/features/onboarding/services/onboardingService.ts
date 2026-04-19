import { ENDPOINTS } from '~/core/api/endpoints'
import type { ItemResponse } from '~/shared/types/common'

export interface OnboardingStep {
  key: string
  label: string
  completed: boolean
  skipped: boolean
}

export interface OnboardingProgress {
  steps: OnboardingStep[]
  completed_count: number
  total_steps: number
  percent: number
}

export interface SetupCoaPayload {
  template_id?: number
  manual_accounts?: Array<{
    code: string
    name_ar: string
    name_en: string
    type: 'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'Expense'
    parent_id?: number
  }>
}

export interface SetupFiscalYearPayload {
  start_date: string
  end_date: string
  period_length: 'monthly' | 'quarterly'
}

export interface WizardTemplate {
  id: number
  slug: string
  name_ar: string
  name_en: string
  industry: string
  description: string
  accounts_count: number
  includes_sample_data: boolean
}

export interface OpeningBalancesPayload {
  opening_balances: Array<{ account_id: number; debit?: number; credit?: number }>
}

export function onboardingService() {
  const api = useApi()

  return {
    progress: () =>
      api.get<ItemResponse<OnboardingProgress>>(ENDPOINTS.onboarding.progress).then(r => r.data),
    completeStep: (step: string, idempotencyKey?: string) =>
      api.post<ItemResponse<OnboardingProgress>>(ENDPOINTS.onboarding.completeStep, { step }, { idempotencyKey }).then(r => r.data),
    skip: (idempotencyKey?: string) =>
      api.post<ItemResponse<OnboardingProgress>>(ENDPOINTS.onboarding.skip, undefined, { idempotencyKey }).then(r => r.data),

    setupCoa: (payload: SetupCoaPayload, idempotencyKey: string) =>
      api.post<{ data: { accounts_created: number } }>(ENDPOINTS.onboarding.setupCoa, payload, { idempotencyKey }),
    setupFiscalYear: (payload: SetupFiscalYearPayload, idempotencyKey: string) =>
      api.post<ItemResponse<{ fiscal_year_id: number }>>(ENDPOINTS.onboarding.setupFiscalYear, payload, { idempotencyKey }).then(r => r.data),
    loadSampleData: (idempotencyKey: string) =>
      api.post<{ data: { created: number } }>(ENDPOINTS.onboarding.loadSampleData, undefined, { idempotencyKey }),
    inviteTeamMember: (payload: { email: string; name: string; role: string }, idempotencyKey?: string) =>
      api.post<{ data: Record<string, unknown> }>(ENDPOINTS.onboarding.inviteTeamMember, payload, { idempotencyKey }),
  }
}

export function onboardingWizardService() {
  const api = useApi()

  return {
    progress: () =>
      api.get<ItemResponse<OnboardingProgress>>(ENDPOINTS.onboardingWizard.progress).then(r => r.data),
    templates: () =>
      api.get<{ data: WizardTemplate[] }>(ENDPOINTS.onboardingWizard.templates).then(r => r.data),
    selectTemplate: (templateId: number, idempotencyKey?: string) =>
      api.post<ItemResponse<OnboardingProgress>>(
        ENDPOINTS.onboardingWizard.selectTemplate, { template_id: templateId }, { idempotencyKey },
      ).then(r => r.data),
    importBalances: (payload: OpeningBalancesPayload, idempotencyKey: string) =>
      api.post<{ data: { imported: number } }>(
        ENDPOINTS.onboardingWizard.importBalances, payload, { idempotencyKey },
      ),
    completeStep: (step: string, idempotencyKey?: string) =>
      api.post<ItemResponse<OnboardingProgress>>(
        ENDPOINTS.onboardingWizard.completeStep, { step }, { idempotencyKey },
      ).then(r => r.data),
    skipStep: (step: string, reason?: string, idempotencyKey?: string) =>
      api.post<ItemResponse<OnboardingProgress>>(
        ENDPOINTS.onboardingWizard.skipStep, { step, reason }, { idempotencyKey },
      ).then(r => r.data),
  }
}
