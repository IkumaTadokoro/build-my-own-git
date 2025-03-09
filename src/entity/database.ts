import type { Blob } from './blob'
import type { Commit } from './commit'
import type { Tree } from './tree'
import { Buffer } from 'node:buffer'
import fs from 'node:fs/promises'
import path from 'node:path'
import { getSystemErrorName } from 'node:util'
import { deflateSync } from 'node:zlib'
import { isNodeError } from '../util/error'
import { createSha1Hash } from '../util/hash'
import { generateRandomString } from '../util/random'

export class Database {
  constructor(private readonly pathname: string) {}

  async store(blob: Blob | Tree | Commit): Promise<void> {
    const raw = blob.toString()
    const buffer = Buffer.from(raw, 'ascii')
    const content = `${blob.type} ${raw.length}\0${buffer}` as const
    const hash = createSha1Hash(content)
    blob.oid = hash
    await this.writeObject(hash, content)
  }

  private async writeObject(oid: string, content: string): Promise<void> {
    const objectPath = path.join(this.pathname, oid.slice(0, 2), oid.slice(2))
    const dirname = path.dirname(objectPath)

    const tmpPath = path.join(dirname, generateRandomString(6))

    const flags = 'wx+'
    let fileHandle: fs.FileHandle | null = null
    try {
      fileHandle = await fs.open(tmpPath, flags)
    }
    catch (error) {
      if (isNodeError(error) && error.errno) {
        const name = getSystemErrorName(error.errno)
        if (name === 'ENOENT') {
          await fs.mkdir(dirname, { recursive: true })
          fileHandle = await fs.open(tmpPath, flags)
        }
      }
    }
    const compressed = deflateSync(content, { level: 9 })
    await fileHandle?.write(compressed)
    await fileHandle?.close()

    await fs.rename(tmpPath, objectPath)
  }
}
