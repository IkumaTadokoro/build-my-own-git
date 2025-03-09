import { env } from 'node:process'

export interface GitUser {
  name: string
  email: string
  timestamp: number
  timezoneOffset: number
}

export function GitUser(): GitUser {
  return {
    name: env.GIT_AUTHOR_NAME ?? '',
    email: env.GIT_AUTHOR_EMAIL ?? '',
    timestamp: 0,
    timezoneOffset: 0,
  }
}
