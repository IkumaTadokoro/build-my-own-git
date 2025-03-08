import fs from 'node:fs/promises'
import path from 'node:path'
import { exit } from 'node:process'

export async function init(pathname: string): Promise<void> {
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
