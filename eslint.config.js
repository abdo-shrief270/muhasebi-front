/**
 * Flat ESLint config — minimum viable per §5.1 of docs/UI_UX_SPEC.md.
 *
 * The RTL rule is the load-bearing one: physical Tailwind props
 * (ml-*, mr-*, pl-*, pr-*, left-*, right-*) are forbidden inside
 * app/components/ because they break Arabic layout. Use logical
 * props instead: ms-*, me-*, ps-*, pe-*, start-*, end-*.
 */
import js from '@eslint/js'

const physicalTailwindRe = /\b(?:ml|mr|pl|pr|left|right|border-l|border-r|rounded-l|rounded-r|rounded-tl|rounded-tr|rounded-bl|rounded-br)(?:-[a-z0-9/\[\]_.-]+)?\b/

export default [
  {
    ignores: ['.nuxt/**', '.output/**', '.dist/**', 'node_modules/**', 'dist/**'],
  },

  js.configs.recommended,

  // RTL hygiene: forbid physical Tailwind spacing inside app/components/*.
  // Matches class strings in both template class="" and :class="" bindings.
  {
    files: ['app/components/**/*.vue', 'app/layouts/**/*.vue', 'app/pages/**/*.vue', 'app/features/**/*.vue'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: `Literal[value=/${physicalTailwindRe.source}/]`,
          message:
            'Physical Tailwind classes (ml-*, mr-*, pl-*, pr-*, left-*, right-*, border-l*, rounded-l*) break RTL. Use logical props: ms-*, me-*, ps-*, pe-*, start-*, end-*, border-s*, border-e*, rounded-s*, rounded-e*.',
        },
      ],
    },
  },
]
