import * as webpack from 'webpack'
import { Argv } from 'ssr-types'
import { getClientWebpack, buildConfig, webpackDevServerConfig } from '../config'
import { webpackPromisify } from '../utils/promisify'

const WebpackDevServer = require('webpack-dev-server-ssr')

const { port, host, webpackStatsOption } = buildConfig
const startClientServer = (argv: Argv) => {
  return new Promise((resolve, reject) => {
    const clientConfig = getClientWebpack(argv)
    const compiler = webpack(clientConfig)
    const server = new WebpackDevServer(compiler, webpackDevServerConfig)
    compiler.hooks.done.tap('WebpackDevMiddleware', (stats) => {
      // Do the stuff in nextTick, because bundle may be invalidated
      // if a change happened while compiling
      resolve()
    })
    server.listen(port, host)
  })
}

const startClientBuild = async (argv: Argv) => {
  const clientConfig = getClientWebpack(argv)
  const stats = await webpackPromisify(clientConfig)
  console.log(stats.toString(webpackStatsOption))
}

export {
  startClientServer,
  startClientBuild
}
