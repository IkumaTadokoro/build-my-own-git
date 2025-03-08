import type { Tree } from '.'
import { timestamp } from './util'

interface Author {
  name: string
  email: string
}

export class Commit {
  readonly type = 'commit'
  public oid: string | null = null

  constructor(public tree: Tree['oid'], public author: Author, public message: string) {}

  toString(): string {
    const lines = [
      `tree ${this.tree?.toString()}`,
      `author ${this.author.name} <${this.author.email}> ${timestamp()}`,
      `committer ${this.author.name} <${this.author.email}> ${timestamp()}`,
      '',
      this.message,
    ]

    return lines.join('\n')
  }
}
