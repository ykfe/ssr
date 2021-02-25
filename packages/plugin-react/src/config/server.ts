import { join } from 'path'
import  webpack from 'webpack'
import { loadConfig, getLocalNodeModules } from 'ssr-server-utils'
import  WebpackChain from 'webpack-chain'
import { getBaseConfig } from './base'
import { nodeExternals } from '../utils/externals'

const loadModule = require.resolve

const getServerWebpack = (chain: WebpackChain) => {
  const config = loadConfig()
  const { isDev, cwd, getOutput, chainServerConfig, whiteList, chunkName } = config
  getBaseConfig(chain)
  chain.devtool(isDev ? 'eval-source-map' : false)
  chain.target('node')
  chain.entry(chunkName)
    .add(loadModule('../entry/server-entry'))
    .end()
    .output
    .path(getOutput().serverOutPut)
    .filename('[name].server.js')
    .libraryTarget('commonjs')

  chain.module
    .rule('compile')
    .test(/\.(js|mjs|jsx|ts|tsx)$/)
    .exclude
    .add(/node_modules/)
    .end()
    .use('babel-loader')
    .loader('babel-loader')
    .options({
      cacheDirectory: true,
      cacheCompression: false,
      presets: [
        [
          '@babel/preset-env',
          {
            modules: false
          }
        ],
        ['react-app', { flow: false, typescript: true }]
      ],
      plugins: [
        [
          'import',
          {
            libraryName: 'antd',
            libraryDirectory: 'lib',
            style: 'css'
          }
        ]
      ]
    })
    .end()

  const modulesDir = [join(cwd, './node_modules')]
  if (isDev) {
    modulesDir.push(getLocalNodeModules())
  }
  chain.externals(nodeExternals({
    whitelist: [/\.(css|less|sass|scss)$/, /ssr-temporary-routes/, /^antd.*?css/].concat(whiteList || []),
    // externals Dir contains example/xxx/node_modules ssr/node_modules
    modulesDir
  }))

  chain.when(isDev, () => {
    chain.watch(true)
  })

  chain.plugin('define').use(webpack.DefinePlugin, [{
    __isBrowser__: false
  }])

  chainServerConfig(chain) // 合并用户自定义配置

  return chain.toConfig()
}

export {
  getServerWebpack
}
