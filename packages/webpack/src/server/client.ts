import webpack from 'webpack'
import { loadConfig } from 'ssr-server-utils'
import { webpackPromisify } from '../utils/promisify'

const WebpackDevServer = require('webpack-dev-server-ssr')
const config = loadConfig()

const startClientServer = async (webpackConfig: webpack.Configuration) => {
  const { webpackDevServerConfig, fePort, host } = config
  return await new Promise((resolve) => {
    const compiler = webpack(webpackConfig)
    const server = new WebpackDevServer(compiler, webpackDevServerConfig)
    compiler.hooks.done.tap('WebpackDevMiddleware', (stats) => {
      resolve()
    })
    server.listen(fePort, host)
  })
}

const startClientBuild = async (webpackConfig: webpack.Configuration) => {
  const { webpackStatsOption } = config
  const stats = await webpackPromisify(webpackConfig)
  console.log(stats.toString(webpackStatsOption))
}

export {
  startClientServer,
  startClientBuild
}
