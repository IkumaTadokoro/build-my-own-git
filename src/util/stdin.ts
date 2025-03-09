import { stdin } from 'node:process'

export async function read(): Promise<string> {
  const message: string[] = []
  for await (const line of stdin) {
    if (line === '.') {
      break
    }
    message.push(line)
  }
  return message.join('\n')
}
