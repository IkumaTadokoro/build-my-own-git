import { types } from 'node:util'

export function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  return types.isNativeError(error)
}
