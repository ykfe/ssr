import WebpackChain from 'webpack-chain'
import { startClientServer, startServerBuild, startClientBuild } from 'ssr-webpack'
import { getClientWebpack, getServerWebpack } from './config'

export function vuePlugin () {
  return {
    name: 'plugin-vue',
    start: async () => {
      const serverConfigChain = new WebpackChain()
      await startServerBuild(getServerWebpack(serverConfigChain))
      const clientConfigChain = new WebpackChain()
      await startClientServer(getClientWebpack(clientConfigChain))
    },
    build: async () => {
      const serverConfigChain = new WebpackChain()
      await startServerBuild(getServerWebpack(serverConfigChain))
      const clientConfigChain = new WebpackChain()
      await startClientBuild(getClientWebpack(clientConfigChain))
    }
  }
}
