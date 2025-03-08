import type { Entry } from '../entity/entry'
import fs from 'node:fs/promises'
import path from 'node:path'
import { cwd, env, exit, stdout } from 'node:process'
import { Blob } from '../entity/blob'
import { Commit } from '../entity/commit'
import { Database } from '../entity/database'
import { Tree } from '../entity/tree'
import { Workspace } from '../entity/workspace'
import { readStdin } from '../util'

export async function commit(): Promise<void> {
  const rootPath = path.resolve(cwd(), 'playground')
  const gitPath = path.join(rootPath, '.git')
  const dbPath = path.join(gitPath, 'objects')

  const workspace = new Workspace(rootPath)
  const database = new Database(dbPath)

  const files = await workspace.listFiles()
  const entries: Entry[] = []
  for await (const path of files) {
    const data = await workspace.readFile(path)
    const blob = new Blob(data)
    await database.store(blob)
    entries.push({ name: path, oid: blob.oid! })
  }
  const tree = new Tree(entries)
  database.store(tree)

  const name = env.GIT_AUTHOR_NAME ?? 'unknown'
  const email = env.GIT_AUTHOR_EMAIL ?? ''
  const message = await readStdin()
  const commit = new Commit(tree.oid, { name, email }, message)

  await database.store(commit)

  const headPath = path.join(gitPath, 'HEAD')
  const headHandle = await fs.open(headPath, 'w+')
  await headHandle.write(`${commit.oid}\n`)
  await headHandle.close()

  stdout.write(`[(root-commit) ${commit.oid}] ${message.split('\n')[0]}\n`)
  exit(0)
}
