
import { join } from 'path'
import { Mode } from 'ssr-types'
import { getFeDir, getCwd, loadConfig, getLocalNodeModules } from 'ssr-server-utils'
import WebpackChain from 'webpack-chain'
import { setStyle } from '../utils'

const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const loadModule = require.resolve

const getBaseConfig = (chain: WebpackChain) => {
  const config = loadConfig()
  const { moduleFileExtensions, useHash, isDev, cssModulesWhiteList, chainBaseConfig } = config
  const mode = process.env.NODE_ENV as Mode
  chain.mode(mode)
  chain.module.strictExportPresence(true)
  chain
    .resolve
    .modules
    .add('node_modules')
    .add(join(getCwd(), './node_modules'))
    .when(isDev, chain => {
      chain.add(getLocalNodeModules())
    })
    .end()
    .extensions.merge(moduleFileExtensions)
    .end()
  chain.resolve.alias
    .set('@', getFeDir())
    .set('vue$', 'vue/dist/vue.runtime.esm.js')
    .end()
  chain.module
    .rule('images')
    .test(/\.(jpe?g|png|woff|woff2|eot|ttf|svg)(\?[a-z0-9=.]+)?$/)
    .use('url-loader')
    .loader(loadModule('url-loader'))
    .options({
      limit: 10000,
      name: 'static/[name].[hash:8].[ext]',
      // require 图片的时候不用加 .default
      esModule: false,
      fallback: {
        loader: loadModule('file-loader'),
        options: {
          name: 'static/[name].[hash:8].[ext]',
          esModule: false
        }
      }
    })
    .end()

  chain.module
    .rule('vue')
    .test(/\.vue$/)
    .use('vue-loader')
    .loader(loadModule('vue-loader'))
    .end()

  chain
    .plugin('vue-loader')
    .use(require('vue-loader/lib/plugin'))
    .end()

  chain.module
    .rule('compile')
    .test(/\.(js|mjs|ts)$/)
    .exclude
    .add(/node_modules/)
    .end()
    .use('babel-loader')
    .loader(loadModule('babel-loader'))
    .options({
      cacheDirectory: true,
      cacheCompression: false,
      sourceType: 'unambiguous',
      presets: [
        loadModule('@babel/preset-typescript'),
        [
          loadModule('@babel/preset-env'),
          {
            modules: false
            // corejs: 3,
            // useBuiltIns: 'usage'
          }
        ]
      ],
      plugins: [
        [loadModule('@babel/plugin-transform-runtime')]
      ]
    })
    .end()

  setStyle(isDev, chain, /\.css$/, {
    exclude: cssModulesWhiteList,
    rule: 'css',
    modules: false,
    importLoaders: 1
  }) // 设置css
  setStyle(isDev, chain, /\.less$/, {
    rule: 'less',
    loader: 'less-loader',
    modules: false,
    importLoaders: 2
  })

  chain.module
    .rule('svg')
    .test(/\.(svg)(\?.*)?$/)
    .use('file-loader')
    .loader(loadModule('file-loader'))
    .options({
      name: 'static/[name].[hash:8].[ext]',
      esModule: false
    })
    .end()

  chain.module
    .rule('fonts')
    .test(/\.(eot|woff|woff2|ttf)(\?.*)?$/)
    .use('file-loader')
    .loader(loadModule('file-loader'))
    .options({
      name: 'static/[name].[hash:8].[ext]',
      esModule: false
    })
  chain.plugin('minify-css').use(MiniCssExtractPlugin, [{
    filename: useHash ? 'static/css/[name].[contenthash:8].css' : 'static/css/[name].css',
    chunkFilename: useHash ? 'static/css/[name].[contenthash:8].chunk.css' : 'static/css/[name].chunk.css'
  }])
  chainBaseConfig(chain)
  return config
}

export {
  getBaseConfig
}
