import { Configuration, Options } from 'webpack'
import * as Config from 'webpack-chain'
import * as webpackDevServer from 'webpack-dev-server'

export interface Proxy {
  host: string
  match: RegExp
}

export interface BuildConfig {
  cwd: string
  isDev: boolean
  publicPath: string
  useHash: boolean
  host: string
  port: number
  sockPort: number | string
  faasPort: number
  chunkName: string
  getOutput: (funcName: string) => {
    clientOutPut: string;
    serverOutPut: string;
  }
  webpackDevServerConfig: webpackDevServer.Configuration
  loadModule: RequireResolve
  cssOrder: string[]
  jsOrder: string[]
  staticPrefix: string
  devManifest: any
  chainServerConfig: (config: Config) => Configuration
  chainClientConfig: (config: Config) => Configuration
  webpackStatsOption: Options.Stats
  moduleFileExtensions: string[]
  postCssPlugin: any
  whiteList: RegExp[]
  cloudIDE?: boolean
  cssModulesWhiteList: RegExp[]
  prefix?: string
  proxy: Proxy
}

export interface StyleOptions {
  rule: string
  include?: RegExp | RegExp[]
  exclude?: RegExp | RegExp[]
  modules: boolean
  loader?: string
  importLoaders: number
}
