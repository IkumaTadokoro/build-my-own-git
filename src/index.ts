import { cwd } from 'node:process'
import { parseArgs } from 'node:util'
import { commit } from './command/commit2'
import { init } from './command/init'

export async function main(): Promise<void> {
  const { positionals } = parseArgs({ allowPositionals: true })
  const command = positionals.at(0)
  const pathname = positionals.at(1) ?? cwd()

  switch (command) {
    case 'init':
      await init(pathname)
      break
    case 'commit':
      await commit()
      break
    default:
      console.error(`${command} is not a valid command.`)
  }
}

(async () => {
  await main()
})()
