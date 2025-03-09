import path from 'node:path'
import { cwd, exit, stdout } from 'node:process'
import { deflateSync } from 'node:zlib'
import { Blob, Commit, Tree } from '../entity/git-object'
import { Workspace } from '../entity/workspace'
import { toBuffer } from '../util/buffer'
import { create } from '../util/file'
import { read } from '../util/stdin'

export async function commit(): Promise<void> {
  const rootPath = path.resolve(cwd(), 'playground')
  const gitPath = path.join(rootPath, '.git')
  const dbPath = path.join(gitPath, 'objects')

  const workspace = new Workspace(rootPath)

  const files = await workspace.listFiles()
  const blobPromises = files.map(async (file) => {
    const content = await workspace.readFile(file)
    const blob = Blob({ content })
    return { name: file, id: blob.id, mode: '100644' }
  })
  const entries = await Promise.all(blobPromises)

  const tree = Tree({ entries })
  const message = await read()
  const commit = Commit({ treeId: tree.id, message })

  const blobSavePromises = entries.map(async (entry) => {
    const blobObjectPath = path.join(dbPath, entry.id.slice(0, 2), entry.id.slice(2))
    await create({
      dir: path.dirname(blobObjectPath),
      filePath: blobObjectPath,
      content: deflateSync(`blob ${entry.name.length}\0${entry.name}`, { level: 9 }),
    })
  })
  await Promise.all(blobSavePromises)

  const treeObjectPath = path.join(dbPath, tree.id.slice(0, 2), tree.id.slice(2))
  await create({
    dir: path.dirname(treeObjectPath),
    filePath: treeObjectPath,
    content: deflateSync(`${tree.type} ${tree.toString().length}\0${tree.toString()}`, { level: 9 }),
  })

  const commitObjectPath = path.join(dbPath, commit.id.slice(0, 2), commit.id.slice(2))
  await create({
    dir: path.dirname(commitObjectPath),
    filePath: commitObjectPath,
    content: deflateSync(`${commit.type} ${commit.toString().length}\0${commit.toString()}`, { level: 9 }),
  })

  await create({ dir: gitPath, filePath: path.join(gitPath, 'HEAD'), content: toBuffer(`${commit.id}\n`) })

  stdout.write(`[(root-commit) ${commit.id}] ${message.split('\n')[0]}\n`)
  exit(0)
}
