export function timestamp(): string {
  const now = new Date()
  return now.toISOString()
}

export function timezone(): number {
  return new Date().getTimezoneOffset()
}
