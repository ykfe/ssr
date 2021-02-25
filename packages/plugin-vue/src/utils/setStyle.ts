
import WebpackChain from 'webpack-chain'
import { StyleOptions } from 'ssr-types'

const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const loadModule = require.resolve

const setStyle = (isDev: boolean, chain: WebpackChain, reg: RegExp, options: StyleOptions) => {
  const { include, exclude, modules, importLoaders, loader } = options
  chain.module
    .rule(options.rule)
    .test(reg)
    .when(Boolean(include), rule => {
      include && rule.include.add(include).end()
    })
    .when(Boolean(exclude), rule => {
      exclude && rule.exclude.add(exclude).end()
    })
    .when(isDev, rule => {
      rule.use('hmr')
        .loader(loadModule('css-hot-loader'))
        .end()
    })
    .use('MiniCss')
    .loader(MiniCssExtractPlugin.loader)
    .end()
    .use('css-loader')
    .loader(loadModule('css-loader'))
    .options({
      importLoaders: importLoaders,
      modules: modules
    })
    .end()
    .use('postcss-loader')
    .loader(loadModule('postcss-loader'))
    .options({
      ident: 'postcss',
      plugins: () => [
        require('postcss-flexbugs-fixes'),
        require('postcss-discard-comments'),
        require('postcss-preset-env')({
          autoprefixer: {
            flexbox: 'no-2009'
          },
          stage: 3
        })
      ]
    })
    .end()
    .when(Boolean(loader), rule => {
      loader && rule.use(loader)
        .loader(loadModule(loader))
        .end()
    })
}

export {
  setStyle
}
