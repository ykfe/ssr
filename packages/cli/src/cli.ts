#!/usr/bin/env node
import { fork } from 'child_process'
import { resolve } from 'path'
import * as yargs from 'yargs'
import { Argv } from 'ssr-types'
import { parseFeRoutes, checkDependencies } from 'ssr-server-utils'

checkDependencies()
const spinnerProcess = fork(resolve(__dirname, './spinner')) // 单独创建子进程跑 spinner 否则会被后续的 require 占用进程导致 loading 暂停

yargs
  .command('start', 'Start Server', {}, async (argv: Argv) => {
    spinnerProcess.send({
      message: 'start'
    })
    process.env.NODE_ENV = 'development'
    await parseFeRoutes(argv)
    const { start } = require('./start')
    spinnerProcess.send({
      message: 'stop'
    })
    await start(argv)
  })
  .command('build', 'build server and client files', {}, async (argv: Argv) => {
    spinnerProcess.send({
      message: 'start'
    })
    process.env.NODE_ENV = 'production'
    const { build } = require('./build')
    await parseFeRoutes(argv)
    spinnerProcess.send({
      message: 'stop'
    })
    await build(argv)
  })
  .command('deploy', 'deploy function to aliyun cloud or tencent cloud', {}, async (argv: Argv) => {
    const { deploy } = require('./deploy')
    await deploy(argv)
  })
  .demandCommand(1, 'You need at least one command before moving on')
  .option('version', {
    alias: 'v',
    default: false
  })
  .fail((msg, err) => {
    console.log(msg)
    if (err) {
      console.log(err)
      spinnerProcess.send({
        message: 'stop'
      })
      process.exit(1)
    }
  })
  .parse()
