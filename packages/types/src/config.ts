import { Configuration, Options } from 'webpack'
import httpProxyMiddleware from 'http-proxy-middleware'
import { Config } from './third-party/webpack-chain'
export interface IConfig {
  cwd: string
  isDev: boolean
  publicPath: string
  useHash: boolean
  host: string
  fePort: number
  serverPort: number
  chunkName: string
  getOutput: () => {
    clientOutPut: string
    serverOutPut: string
  }
  cssOrder: string[]
  jsOrder: string[]
  staticPrefix: string
  chainBaseConfig: (config: Config) => Configuration
  chainServerConfig: (config: Config) => Configuration
  chainClientConfig: (config: Config) => Configuration
  webpackStatsOption: Options.Stats
  moduleFileExtensions: string[]
  whiteList: RegExp[]
  cloudIDE?: boolean
  cssModulesWhiteList: RegExp[]
  prefix?: string
  proxy: Proxy
  dynamic: boolean
  feFramework: string
  mode: string
  webpackDevServerConfig: any
  stream: boolean
  customeHeadScript?: Array<{
    describe: object
    content: string
  }>
}
type Optional <T>= { [key in keyof T]?: T[key] }

export type UserConfig = Optional<IConfig>
export interface Proxy {
  [key: string]: httpProxyMiddleware.Options
}
export interface proxyOptions {
  express?: boolean
}

export interface StyleOptions {
  rule: string
  include?: RegExp | RegExp[]
  exclude?: RegExp | RegExp[]
  modules: boolean
  loader?: string
  importLoaders: number
}
