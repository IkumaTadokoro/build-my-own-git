import type { Blob } from './blob'
import type { Commit } from './commit'
import type { Tree } from './tree'
import { Buffer } from 'node:buffer'
import path from 'node:path'
import { deflateSync } from 'node:zlib'
import { create } from '../util/file'
import { createSha1Hash } from '../util/hash'

export class Database {
  constructor(private readonly pathname: string) {}

  async store(blob: Blob | Tree | Commit): Promise<void> {
    const raw = blob.toString()
    const buffer = Buffer.from(raw, 'ascii')
    const content = `${blob.type} ${raw.length}\0${buffer}` as const
    blob.oid = createSha1Hash(content)
    const objectPath = path.join(this.pathname, blob.oid.slice(0, 2), blob.oid.slice(2))
    await create({
      dir: path.dirname(objectPath),
      filePath: objectPath,
      content: deflateSync(content, { level: 9 }),
    })
  }
}
