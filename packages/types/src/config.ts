import { Configuration, Options } from 'webpack'
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
  proxy?: any
  cssOrder: string[]
  jsOrder: string[]
  css?: () => {
    loaderOptions: {
      postcss: {
        plugins: any[]
      }
    }
  }
  chainBaseConfig: (config: Config) => Configuration
  chainServerConfig: (config: Config) => Configuration
  chainClientConfig: (config: Config) => Configuration
  webpackStatsOption: Options.Stats
  moduleFileExtensions: string[]
  whiteList: RegExp[]
  cloudIDE?: boolean
  cssModulesWhiteList: RegExp[]
  prefix?: string
  dynamic: boolean
  mode: string
  webpackDevServerConfig: any
  stream: boolean
  customeHeadScript?: Array<{
    describe: object
    content: string
  }>
  locale?: {
    enable: false
  }
}
type Optional <T>= { [key in keyof T]?: T[key] }

export interface proxyOptions {
  express?: boolean
}
export type UserConfig = Optional<IConfig>

export interface StyleOptions {
  rule: string
  include?: RegExp | RegExp[]
  exclude?: RegExp | RegExp[]
  modules: boolean
  loader?: string
  importLoaders: number
}
