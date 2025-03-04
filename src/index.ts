import { Buffer } from 'node:buffer'
import { createHash } from 'node:crypto'
import fs from 'node:fs/promises'
import path from 'node:path'
import { cwd, exit } from 'node:process'
import { getSystemErrorName, parseArgs, types } from 'node:util'
import { deflateSync } from 'node:zlib'

export async function main(): Promise<void> {
  const { positionals } = parseArgs({ allowPositionals: true })
  const command = positionals.at(0)
  const pathname = positionals.at(1) ?? cwd()

  switch (command) {
    case 'init':
      await init(pathname)
      break
    case 'commit':
      await commit()
      break
    default:
      console.error(`${command} is not a valid command.`)
  }
}

async function init(pathname: string): Promise<void> {
  const rootPath = path.resolve(pathname, 'playground')
  const gitPath = path.join(rootPath, '.git')
  for await (const dir of ['objects', 'refs']) {
    const dirPath = path.join(gitPath, dir)
    try {
      await fs.mkdir(dirPath, { recursive: true })
    }
    catch (error) {
      console.error(`fatal: ${error}`)
      exit(1)
    }
  }
}

async function commit(): Promise<void> {
  const rootPath = path.resolve(cwd(), 'playground')
  const gitPath = path.join(rootPath, '.git')
  const dbPath = path.join(gitPath, 'objects')

  const workspace = new Workspace(rootPath)
  const database = new Database(dbPath)

  const files = await workspace.listFiles()
  for await (const path of files) {
    const data = await workspace.readFile(path)
    const blob = new Blob(data)
    await database.store(blob)
  }
}

// working treeに対して責務を持つクラス
class Workspace {
  private IGNORE = ['.git', '.', '..']

  constructor(private readonly pathname: string) {}

  async listFiles(): Promise<string[]> {
    const files = await fs.readdir(this.pathname)
    return files.filter(file => !this.IGNORE.includes(file))
  }

  async readFile(filename: string): Promise<string> {
    const filePath = path.join(this.pathname, filename)
    return await fs.readFile(filePath, 'utf-8')
  }
}

class Blob {
  readonly type = 'blob'
  oid: string | null = null

  constructor(private readonly content: string) {}

  toString(): string {
    return this.content
  }
}

class Database {
  private readonly TEMP_CHARS = [
    ...Array.from({ length: 9 }, (_, i) => String.fromCharCode(49 + i)),
    ...Array.from({ length: 26 }, (_, i) => String.fromCharCode(97 + i)),
    ...Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i)),
  ] // 1-9, a-z, A-Z

  constructor(private readonly pathname: string) {}

  async store(blob: Blob): Promise<void> {
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

function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  return types.isNativeError(error)
}

(async () => {
  main()
})()
