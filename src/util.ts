import { types } from 'node:util'

export function timestamp(): string {
  const now = new Date()
  return now.toISOString()
}

export function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  return types.isNativeError(error)
}
