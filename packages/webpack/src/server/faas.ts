import { useKoaDevPack } from '@midwayjs/faas-dev-pack'
import * as Koa from 'koa'
import { logGreen, getCwd } from 'ssr-server-utils'
import { buildConfig } from '../config'

const kProxy = require('koa-proxy')
const { port, faasPort, cloudIDE, proxy } = buildConfig

const app = new Koa()

const startFaasServer = () => {
  const cwd = getCwd()

  app.use(kProxy({
    host: `http://127.0.0.1:${port}`, // 本地开发的时候代理前端打包出来的资源地址
    match: /(\/static)|(\/sockjs-node)|hot-update|__webpack_dev_server__/
  }))

  if (proxy) {
    // custom proxy
    app.use(kProxy(proxy))
  }

  app.use(useKoaDevPack({
    functionDir: cwd
  }))

  app.listen(faasPort, () => {
    if (cloudIDE && process.env.HOSTNAME) {
      // cloud ide 在云端启动服务
      const hostName = process.env.HOSTNAME
      if (hostName) {
        logGreen(`Server is listening on http://${hostName.split('-').slice(0, -2).join('-')}-3000.xide.aliyun.com/`)
      }
    } else {
      logGreen('Server is listening on http://localhost:3000')
    }
  })
}

export {
  startFaasServer
}
