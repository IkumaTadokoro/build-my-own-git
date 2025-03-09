import type { Entry } from '../entity/entry'
import path from 'node:path'
import { cwd, env, exit, stdout } from 'node:process'
import { Blob } from '../entity/blob'
import { Commit } from '../entity/commit'
import { Database } from '../entity/database'
import { Tree } from '../entity/tree'
import { Workspace } from '../entity/workspace'
import { toBuffer } from '../util/buffer'
import { create } from '../util/file'
import { read } from '../util/stdin'

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
  const message = await read()
  const commit = new Commit(tree.oid, { name, email }, message)

  await database.store(commit)

  await create({ dir: gitPath, filePath: path.join(gitPath, 'HEAD'), content: toBuffer(`${commit.oid}\n`) })

  stdout.write(`[(root-commit) ${commit.oid}] ${message.split('\n')[0]}\n`)
  exit(0)
}
