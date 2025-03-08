export class Blob {
  readonly type = 'blob'
  oid: string | null = null

  constructor(private readonly content: string) {}

  toString(): string {
    return this.content
  }
}
