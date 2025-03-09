import type { BinaryLike } from 'node:crypto'
import { createHash } from 'node:crypto'

/**
 * 与えられた内容に対する SHA-1 ハッシュを生成します。
 *
 * @param content ハッシュ化する内容。エンコーディングは UTF-8 です。
 * @returns 生成された SHA-1 ハッシュ。
 */
export function createSha1Hash(content: BinaryLike): string {
  const sha1Hash = createHash('sha1')
  sha1Hash.update(content)
  return sha1Hash.digest('hex')
}
