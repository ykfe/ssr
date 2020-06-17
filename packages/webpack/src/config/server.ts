import { join } from 'path'
import * as webpack from 'webpack'
import { Argv } from 'ssr-server-utils'
import { getBaseConfig } from './base'
import { buildConfig } from './config'
import { nodeExternals } from '../plugins/external'

const { isDev, cwd, getOutput, loadModule, chainServerConfig, whiteList } = buildConfig

const getServerWebpack = (argv: Argv) => {
  // @ts-ignore
  const { funcName } = argv.faasRoutes[0]
  const config = getBaseConfig()

  config.devtool(isDev ? 'eval-source-map' : false)

  config.target('node')

  config.entry('Page')
    .add(loadModule('../entry/server-entry'))
    .end()
    .output
    .path(getOutput(funcName).serverOutPut)
    .filename('[name].server.js')
    .libraryTarget('commonjs')

  config.module
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

  config.externals(nodeExternals({
    whitelist: [/\.(css|less|sass|scss)$/, /ssr\-cache/, /^antd.*?css/].concat(whiteList || []),
    // externals Dir contains packages/webpack-config/node_modules spa/node_modules ssr/node_modules
    modulesDir: [join(__dirname, '../node_modules'), join(cwd, './node_modules'), join(__dirname, '../../../node_modules')]
  }))

  config.when(isDev, () => {
    config.watch(true)
  })

  config.plugin('define').use(webpack.DefinePlugin, [{
    __isBrowser__: false
  }])

  chainServerConfig(config) // 合并用户自定义配置
  return config.toConfig()
}

export {
  getServerWebpack
}
