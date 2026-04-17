function hex(n: number): string {
  return n.toString(16).padStart(2, '0')
}

export function generateRequestId(): string {
  const bytes = new Uint8Array(4)
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(bytes)
  } else {
    for (let i = 0; i < 4; i++) bytes[i] = Math.floor(Math.random() * 256)
  }
  const rand = Array.from(bytes, hex).join('')
  return `${rand}-${Date.now().toString(36)}`
}
