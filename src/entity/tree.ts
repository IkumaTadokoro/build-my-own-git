import type { Entry } from './entry'
import { Buffer } from 'node:buffer'

export class Tree {
  private ENTRY_FORMAT = 'Z*H40'
  private MODE = '100644'

  readonly type = 'tree'

  oid: string | null = null

  constructor(private readonly entries: Entry[]) {}

  toString(): string {
    // エントリを名前でソート
    const sortedEntries = [...this.entries].sort((a, b) => {
      if (a.name < b.name)
        return -1
      if (a.name > b.name)
        return 1
      return 0
    })

    // 各エントリをバイナリ形式にパック
    const buffers = sortedEntries.map((entry) => {
      // モードとファイル名を文字列として連結
      const modeAndName = `${this.MODE} ${entry.name}`

      // ファイル名部分（ヌル終端文字列としてエンコード）
      const nameBuffer = Buffer.alloc(modeAndName.length + 1) // +1 for null terminator
      nameBuffer.write(modeAndName)

      // OIDを16進数からバイナリに変換
      const oidBuffer = Buffer.from(entry.oid, 'hex')

      // 2つのバッファを連結
      return Buffer.concat([nameBuffer, oidBuffer])
    })

    // すべてのエントリを1つのバッファに結合
    return Buffer.concat(buffers).toString()
  }
}
