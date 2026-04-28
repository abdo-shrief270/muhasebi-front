import DOMPurify from 'isomorphic-dompurify'

/**
 * Sanitize HTML from untrusted sources (API responses) before feeding it to
 * `v-html`. Defence-in-depth: even if the backend claims to sanitize, we run
 * DOMPurify on the client (and server during SSR) so a backend regression
 * can't immediately become a stored-XSS vector.
 *
 * `iframe`, `object`, `embed`, `script`, and inline event handlers are all
 * stripped by default; we additionally forbid `style` attributes to block CSS
 * exfiltration tricks and disallow any protocol other than http/https/mailto
 * on links.
 */
export function sanitizeHtml(input: string | null | undefined): string {
  if (!input) return ''
  return DOMPurify.sanitize(input, {
    FORBID_ATTR: ['style', 'onerror', 'onload', 'onclick'],
    FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'style', 'form', 'input'],
    ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|tel):|[^a-z]|[a-z+.-]+(?:[^a-z+.\-:]|$))/i,
  })
}
