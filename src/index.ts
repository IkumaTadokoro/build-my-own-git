import fs from 'node:fs/promises'
import path from 'node:path'
import { cwd, exit } from 'node:process'
import { parseArgs } from 'node:util'

export async function main(): Promise<void> {
  const { positionals } = parseArgs({ allowPositionals: true })
  const command = positionals.at(0)
  const pathname = positionals.at(1) ?? cwd()

  switch (command) {
    case 'init':
      await init(pathname)
      break
    default:
      console.error(`${command} is not a valid command.`)
  }
}

async function init(pathname: string): Promise<void> {
  const rootPath = path.resolve(pathname)
  const gitPath = path.join(rootPath, 'playground', '.git')
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

(async () => {
  main()
})()
