import type { Blob } from './blob'
import type { Commit } from './commit'
import type { Tree } from './tree'
import { Buffer } from 'node:buffer'
import { createHash } from 'node:crypto'
import fs from 'node:fs/promises'
import path from 'node:path'
import { getSystemErrorName } from 'node:util'
import { deflateSync } from 'node:zlib'
import { isNodeError } from '../util/error'

export class Database {
  private readonly TEMP_CHARS = [
    ...Array.from({ length: 9 }, (_, i) => String.fromCharCode(49 + i)),
    ...Array.from({ length: 26 }, (_, i) => String.fromCharCode(97 + i)),
    ...Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i)),
  ] // 1-9, a-z, A-Z

  constructor(private readonly pathname: string) {}

  async store(blob: Blob | Tree | Commit): Promise<void> {
    const raw = blob.toString()
    const buffer = Buffer.from(raw, 'ascii')
    const content = `${blob.type} ${raw.length}\0${buffer}` as const
    const hash = createHash('sha1').update(content).digest('hex')
    blob.oid = hash
    await this.writeObject(hash, content)
  }

  private async writeObject(oid: string, content: string): Promise<void> {
    const objectPath = path.join(this.pathname, oid.slice(0, 2), oid.slice(2))
    const dirname = path.dirname(objectPath)

    const tmpPath = path.join(dirname, this.generateTmpName())

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

  private generateTmpName(): string {
    return Array.from({ length: 6 }, () => {
      const index = Math.floor(Math.random() * this.TEMP_CHARS.length)
      return this.TEMP_CHARS[index]
    }).join('')
  }
}
