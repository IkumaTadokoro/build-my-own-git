import type { Branded } from '../util/types'
import { Buffer } from 'node:buffer'
import { toBuffer } from '../util/buffer'
import { createSha1Hash } from '../util/hash'
import { GitUser } from './user'

export type GitObjectId = Branded<string, 'ObjectId'>

export interface GitObjectProps {
  id: GitObjectId
}

function buildGitObjectId(type: string, content: Buffer): GitObjectId {
  const header = Buffer.from(`${type} ${content.length}\0`)
  const fullObject = Buffer.concat([header, content])
  const hash = createSha1Hash(fullObject)
  return hash as GitObjectId
}

export interface BlobContent {
  content: Uint8Array | string
}
export type Blob = {
  type: "blob"
} & BlobContent & GitObjectProps
export function Blob(blobContent: BlobContent): Blob {
  const content = toBuffer(blobContent.content)
  const id = buildGitObjectId('blob', content)

  return {
    ...blobContent,
    type: 'blob',
    id,
  }
}

export interface TreeEntryContent {
  mode: string
  name: string
  id: GitObjectId
}

export interface TreeContent {
  entries: TreeEntryContent[]
}
export type Tree = {
  type: 'tree'
} & TreeContent & GitObjectProps
export function Tree(content: TreeContent): Tree {
  const sortedEntries = [...content.entries].sort((a, b) =>
    a.name.localeCompare(b.name),
  )

  const entriesBuffers = sortedEntries.map(serializeTreeEntry)
  const contentBuffer = Buffer.concat(entriesBuffers)

  const id = buildGitObjectId('tree', contentBuffer)

  return {
    ...content,
    type: 'tree',
    id,
  }
}
function serializeTreeEntry(entry: TreeEntryContent): Buffer {
  const mode = Buffer.from(`${entry.mode} `)
  const name = Buffer.from(`${entry.name}\0`)
  // IDを16進数文字列からバイナリに変換
  const id = Buffer.from(entry.id.replace(/[^0-9a-f]/gi, ''), 'hex')
  return Buffer.concat([mode, name, id])
}

export interface CommitContent {
  treeId: GitObjectId
  message: string
}
interface CommitCreator {
  author: GitUser
  committer: GitUser
}
export type Commit = {
  type: 'commit'
} & CommitContent & CommitCreator & GitObjectProps
export function Commit(content: CommitContent): Commit {
  const author = GitUser()
  const committer = GitUser()
  const contentBuffer = Buffer.from(serializeCommit({ ...content, author, committer }), 'utf8')

  const type = 'commit'
  const id = buildGitObjectId(type, contentBuffer)

  return {
    ...content,
    type,
    author,
    committer,
    id,
  }
}

function serializeCommit(commit: CommitContent & CommitCreator): string {
  let result = `tree ${commit.treeId}\n`

  const { name: authorName, email: authorEmail, timestamp: authorTime, timezoneOffset: authorTz } = commit.author
  result += `author ${authorName} <${authorEmail}> ${authorTime} ${authorTz}\n`

  const { name: committerName, email: committerEmail, timestamp: committerTime, timezoneOffset: committerTz } = commit.committer
  result += `committer ${committerName} <${committerEmail}> ${committerTime} ${committerTz}\n`

  result += `\n${commit.message}`

  return result
}
