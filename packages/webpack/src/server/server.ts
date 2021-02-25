import webpack from 'webpack'
import { loadConfig } from 'ssr-server-utils'
import { webpackPromisify } from '../utils/promisify'

const startServerBuild = async (webpackConfig: webpack.Configuration) => {
  const { webpackStatsOption } = loadConfig()
  const stats = await webpackPromisify(webpackConfig)
  console.log(stats.toString(webpackStatsOption))
}

export {
  startServerBuild
}
