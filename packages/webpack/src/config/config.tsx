import { getCwd, getUserConfig, BuildConfig } from 'ssr-server-utils'
import { Configuration } from 'webpack-dev-server'

const userConfig = getUserConfig()

type ClientLogLevel = 'error'

const publicPath = '/'
const moduleFileExtensions = [
  '.web.mjs',
  '.mjs',
  '.web.js',
  '.js',
  '.web.ts',
  '.ts',
  '.web.tsx',
  '.tsx',
  '.json',
  '.web.jsx',
  '.jsx'
]

const isDev = process.env.NODE_ENV !== 'production'
const port = 8000
const faasPort = 3000
const host = '0.0.0.0'
const cwd = getCwd()
const chunkName = 'Page'
const devManifest = {
  'Page.css': `/static/css/${chunkName}.chunk.css`,
  'Page.js': `/static/js/${chunkName}.chunk.js`,
  'runtime~Page.js': `/static/js/runtime~${chunkName}.js`,
  'vendor.js': `/static/js/vendor.chunk.js`
}
const clientLogLevel: ClientLogLevel = 'error'
const useHash = !isDev // 生产环境默认生成hash
const whiteList: RegExp[] = []
const jsOrder = [`runtime~${chunkName}.js`, 'vendor.js', `${chunkName}.js`]
const cssOrder = [`${chunkName}.css`]

const webpackStatsOption = {
  assets: true,  // 添加资源信息
  cachedAssets: false,  // 显示缓存的资源（将其设置为 `false` 则仅显示输出的文件）
  children: false, // 添加 children 信息
  chunks: false, // 添加 chunk 信息（设置为 `false` 能允许较少的冗长输出）
  colors: true, // 以不同颜色区分构建信息
  modules: false,  // 添加构建模块信息
  warnings: false,
  entrypoints: false
}

const getOutput = (funcName: string) => ({
  clientOutPut: `${cwd}/build/${funcName}/client`,
  serverOutPut: `${cwd}/build/${funcName}/server`
})

const webpackDevServerConfig: Configuration = {
  stats: webpackStatsOption,
  // @ts-ignore
  disableInfo: true, // 关闭webpack-dev-server 自带的server Info信息
  disableHostCheck: true,
  publicPath: publicPath,
  hotOnly: true,
  host,
  sockPort: port,
  hot: true,
  port: port,
  clientLogLevel: clientLogLevel,
  // @ts-ignore
  progress: true,
  headers: {
    'access-control-allow-origin': '*'
  }
}

const loadModule = require.resolve

const staticPrefix = userConfig.staticPrefix || ''

const chainClientConfig = () => {
  // 覆盖默认webpack配置
}
const chainServerConfig = () => {
  // 覆盖默认webpack配置
}

const buildConfig: BuildConfig = Object.assign({},{
  chainServerConfig,
  chainClientConfig,
  cwd,
  isDev,
  publicPath,
  useHash,
  host,
  moduleFileExtensions,
  port,
  faasPort,
  chunkName,
  jsOrder,
  cssOrder,
  getOutput,
  loadModule,
  devManifest,
  webpackDevServerConfig,
  webpackStatsOption,
  staticPrefix,
  whiteList
}, userConfig)

export {
  buildConfig
}
