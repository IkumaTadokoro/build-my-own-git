import fs from 'node:fs/promises'
import path from 'node:path'

export class Workspace {
  private IGNORE = ['.git', '.', '..']

  constructor(private readonly pathname: string) {}

  async listFiles(): Promise<string[]> {
    const files = await fs.readdir(this.pathname)
    return files.filter(file => !this.IGNORE.includes(file))
  }

  async readFile(filename: string): Promise<string> {
    const filePath = path.join(this.pathname, filename)
    return await fs.readFile(filePath, 'utf-8')
  }
}
