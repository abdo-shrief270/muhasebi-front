/**
 * Onboarding wizard state — §8.5 of docs/UI_UX_SPEC.md.
 *
 * The `onboarding.vue` layout renders the step bar + sticky footer; pages
 * drive the state through this composable. State is kept in an `app:state`
 * key so any page within the layout can read/write it without prop drilling.
 */
export interface WizardStep {
  id: string
  label: string
  completed?: boolean
}

interface WizardState {
  steps: WizardStep[]
  currentIndex: number
  canProceed: boolean
  onBack?: () => void
  onNext?: () => void
}

const STATE_KEY = 'muhasebi:onboarding-wizard'

export function useOnboardingWizard() {
  const state = useState<WizardState>(STATE_KEY, () => ({
    steps: [],
    currentIndex: 0,
    canProceed: false,
  }))

  function configure(next: Partial<WizardState>) {
    state.value = { ...state.value, ...next }
  }

  return {
    state: readonly(state),
    configure,
    goNext() { state.value.onNext?.() },
    goBack() { state.value.onBack?.() },
  }
}
