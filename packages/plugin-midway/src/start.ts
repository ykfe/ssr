import { exec } from 'child_process'
import { loadConfig } from 'ssr-server-utils'
import { Argv } from 'ssr-types'

const { cliFun } = require('@midwayjs/cli/bin/cli')

const start = (argv: Argv) => {
  const config = loadConfig()
  exec('cross-env npx ets', async (err, stdout) => {
    if (err) {
      console.log(err)
      return
    }
    console.log(stdout)
    // 透传参数给 midway-bin
    argv._[0] = 'dev'
    argv.ts = true
    argv.port = config.serverPort
    await cliFun(argv)
  })
}

export {
  start
}
