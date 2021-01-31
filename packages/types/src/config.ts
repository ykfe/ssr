import { Configuration, Options } from 'webpack'
// import * as Config from 'webpack-chain'

import { Config } from './third-party/webpack-chain'
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
  getOutput: () => {
    clientOutPut: string
    serverOutPut: string
  }
  webpackDevServerConfig: any
  loadModule: RequireResolve
  cssOrder: string[]
  jsOrder: string[]
  staticPrefix: string
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
  dynamic?: boolean
  framework?: string
  mode: string
  serverFramework: string
}

export interface StyleOptions {
  rule: string
  include?: RegExp | RegExp[]
  exclude?: RegExp | RegExp[]
  modules: boolean
  loader?: string
  importLoaders: number
}
