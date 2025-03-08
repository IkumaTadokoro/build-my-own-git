import { stdin } from 'node:process'
import { types } from 'node:util'

export function timestamp(): string {
  const now = new Date()
  return now.toISOString()
}

export function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  return types.isNativeError(error)
}

export async function readStdin(): Promise<string> {
  const message: string[] = []
  for await (const line of stdin) {
    if (line === '.') {
      break
    }
    message.push(line)
  }
  return message.join('\n')
}
