import { Buffer } from 'node:buffer'

export function toBuffer(data: string | Uint8Array | Buffer): Buffer {
  if (Buffer.isBuffer(data))
    return data
  if (data instanceof Uint8Array)
    return Buffer.from(data)
  return Buffer.from(data, 'utf8')
}
