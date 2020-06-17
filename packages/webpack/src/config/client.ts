
import * as webpack from 'webpack'
import { Argv, getUserConfig } from 'ssr-server-utils'
import { getBaseConfig } from './base'
import { buildConfig } from './config'

const { prefix } = getUserConfig()
const { publicPath, isDev, chunkName, getOutput, cwd, useHash, loadModule, chainClientConfig } = buildConfig
const shouldUseSourceMap = isDev || process.env.GENERATE_SOURCEMAP
const ModuleNotFoundPlugin = require('react-dev-utils/ModuleNotFoundPlugin')
const safePostCssParser = require('postcss-safe-parser')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const generateAnalysis = Boolean(process.env.GENERATE_ANALYSIS)

const getClientWebpack = (argv: Argv) => {
  // @ts-ignore
  const { funcName } = argv.faasRoutes[0]
  const config = getBaseConfig()
  config.resolve.alias
    .set('react-router', loadModule('react-router'))
    .set('react-router-dom', loadModule('react-router-dom'))

  config.devtool(isDev ? 'cheap-module-source-map' : (shouldUseSourceMap ? 'source-map' : false))

  config.entry(chunkName)
    .add(loadModule('../entry/client-entry'))
    .end()
    .output
    .path(getOutput(funcName).clientOutPut)
    .filename(useHash ? 'static/js/[name].[contenthash:8].js' : 'static/js/[name].js')
    .chunkFilename(useHash ? 'static/js/[name].[contenthash:8].chunk.js' : 'static/js/[name].chunk.js')
    .publicPath(publicPath)
    .end()

  config.optimization
    .runtimeChunk(true)
    .splitChunks({
      chunks: 'all',
      name: false,
      cacheGroups: {
        vendors: {
          test: (module: any) => {
            return module.resource &&
            /\.js$/.test(module.resource) &&
            module.resource.match('node_modules')
          },
          name: 'vendor'
        }
      }
    })
    .when(!isDev, optimization => {
      optimization.minimizer('terser')
        .use(loadModule('terser-webpack-plugin'), [{
          terserOptions: {
            parse: {
              ecma: 8
            },
            compress: {
              ecma: 5,
              warnings: false,
              comparisons: false,
              inline: 2
            },
            mangle: {
              safari10: true
            },
            output: {
              ecma: 5,
              comments: false,
              ascii_only: true
            }
          },
          extractComments: false,
          parallel: true,
          cache: true,
          sourceMap: shouldUseSourceMap
        }])
      optimization.minimizer('optimize-css').use(loadModule('optimize-css-assets-webpack-plugin'), [{
        cssProcessorOptions: {
          parser: safePostCssParser,
          map: shouldUseSourceMap ? {
            inline: false,
            annotation: true
          } : false
        }
      }])
    })

  config.plugin('define').use(webpack.DefinePlugin, [{
    __isBrowser__: true,
    prefix: prefix ? JSON.stringify(prefix) : false
  }])

  config.when(!isDev, config => config.plugin('progress').use(loadModule('webpack/lib/ProgressPlugin')))

  config.plugin('moduleNotFound').use(ModuleNotFoundPlugin, [cwd])

  config.plugin('manifest').use(loadModule('webpack-manifest-plugin'), [{
    fileName: 'asset-manifest.json',
    publicPath: publicPath
  }])

  config.when(generateAnalysis, config => {
    config.plugin('analyze').use(BundleAnalyzerPlugin)
  })

  chainClientConfig(config) // 合并用户自定义配置

  return config.toConfig()
}

export {
  getClientWebpack
}
