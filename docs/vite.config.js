// 以下为默认生成的 Vite Config 配置，为了确保应用正确运行请不要删除默认配置中的任何代码

const { join } = require('path')
const vuePlugin = require('@vitejs/plugin-vue')
const rawPlugin = require('vite-raw-plugin')

/**
 * @type {import('vite').UserConfig}
 */
module.exports = {
  plugins: [
    vuePlugin(),
    rawPlugin({
      fileRegex: /\.md$/
    })
  ],
  define: {
    __isBrowser__: true
  },
  resolve: {
    alias: {
      '@': join(process.cwd(), './web')
    },
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue']
  }
}
