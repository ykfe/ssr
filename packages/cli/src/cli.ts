#!/usr/bin/env node
import { fork } from 'child_process'
import { resolve, join } from 'path'
import * as yargs from 'yargs'
import { Argv } from 'ssr-types'
import { promises as fs } from 'fs'
import { getCwd } from 'ssr-server-utils'
const spinnerProcess = fork(resolve(__dirname, './spinner')) // 单独创建子进程跑 spinner 否则会被后续的 require 占用进程导致 loading 暂停
const debug = require('debug')('ssr:cli')
const start = Date.now()

yargs
  .command('start', 'Start Server', {}, async (argv: Argv) => {
    spinnerProcess.send({
      message: 'start'
    })
    process.env.NODE_ENV = 'development'
    process.env.BUILD_TOOL = argv.vite ? 'vite' : 'webpack'
    // 拷贝vite初始化配置
    if (process.env.BUILD_TOOL === 'vite') {
      try {
        await fs.access(join(getCwd(), './vite.config.js'))
      } catch (error) {
        await fs.copyFile(join(getCwd(), './node_modules/ssr-plugin-vue3/src/config/vite.config'), join(getCwd(), './vite.config.js'))
        // const viteConfigContent = await fs.readFile()
        // await fs.writeFile(join(getCwd(), './vite.config.js'), viteConfigContent)
      }
    }

    const { parseFeRoutes, loadPlugin } = await import('ssr-server-utils')
    debug(`require ssr-server-utils time: ${Date.now() - start} ms`)
    const plugin = loadPlugin()
    debug(`loadPlugin time: ${Date.now() - start} ms`)
    await parseFeRoutes()
    spinnerProcess.send({
      message: 'stop'
    })
    debug(`parseFeRoutes ending time: ${Date.now() - start} ms`)
    await plugin.clientPlugin?.start?.(argv)
    debug(`clientPlugin ending time: ${Date.now() - start} ms`)
    await plugin.serverPlugin?.start?.(argv)
    debug(`serverPlugin ending time: ${Date.now() - start} ms`)
  })
  .command('build', 'Build server and client files', {}, async (argv: Argv) => {
    spinnerProcess.send({
      message: 'start'
    })
    process.env.NODE_ENV = 'production'
    const { parseFeRoutes, loadPlugin } = await import('ssr-server-utils')
    const plugin = loadPlugin()
    await parseFeRoutes()
    spinnerProcess.send({
      message: 'stop'
    })
    await plugin.clientPlugin?.build?.(argv)
    await plugin.serverPlugin?.build?.(argv)
  })
  .command('deploy', 'Deploy function to aliyun cloud or tencent cloud', {}, async (argv: Argv) => {
    const { loadPlugin } = await import('ssr-server-utils')

    const plugin = loadPlugin()
    if (!plugin?.serverPlugin?.deploy) {
      console.log('当前插件不支持 deploy 功能，请使用 ssr-plugin-midway 插件 参考 https://www.yuque.com/midwayjs/faas/migrate_egg 或扫码进群了解')
      return
    }
    process.env.NODE_ENV = 'production'
    await plugin.serverPlugin?.deploy?.(argv)
    spinnerProcess.send({
      message: 'stop'
    })
  })
  .demandCommand(1, 'You need at least one command before moving on')
  .option('version', {
    alias: 'v',
    default: false
  })
  .fail((msg, err) => {
    if (err) {
      console.log(err)
      spinnerProcess.send({
        message: 'stop'
      })
      process.exit(1)
    }
    console.log(msg)
  })
  .parse()
