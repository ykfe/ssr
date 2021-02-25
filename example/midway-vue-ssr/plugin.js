const { midwayPlugin } = require('ssr-plugin-midway')
const { vuePlugin } = require('ssr-plugin-vue')

module.exports = {
  serverPlugin: midwayPlugin(),
  clientPlugin: vuePlugin()
}
