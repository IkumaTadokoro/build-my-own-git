import type { Buffer } from 'node:buffer'
import fs from 'node:fs/promises'
import path from 'node:path'
import { getSystemErrorName } from 'node:util'
import { isNodeError } from './error'
import { generateRandomString } from './random'

export async function create({
  dir,
  filePath,
  content,
  flag = 'wx+',
}: {
  dir: string
  filePath: string
  content: Buffer<ArrayBufferLike>
  flag?: string
}): Promise<void> {
  let fileHandle: fs.FileHandle | null = null

  const tmpPath = path.join(dir, generateRandomString(6))

  try {
    fileHandle = await fs.open(tmpPath, flag)
  }
  catch (error) {
    if (isNodeError(error) && error.errno) {
      const name = getSystemErrorName(error.errno)
      if (name === 'ENOENT') {
        await fs.mkdir(dir, { recursive: true })
        fileHandle = await fs.open(tmpPath, flag)
      }
    }
  }
  await fileHandle?.write(content)
  await fileHandle?.close()
  await fs.rename(tmpPath, filePath)
}
