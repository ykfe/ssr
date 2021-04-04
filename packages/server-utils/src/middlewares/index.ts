import { proxyOptions } from 'ssr-types'
import { getDevProxyMiddlewaresArr } from './proxy'

const initialSSRDevProxy = (app: any, options?: proxyOptions) => {
  // 在本地开发阶段代理 serverPort 的资源到 fePort
  // 例如 http://localhost:3000/static/js/page.chunk.js -> http://localhost:8000/static/js/page.chunk.js
  const proxyMiddlewaresArr = getDevProxyMiddlewaresArr(options)
  proxyMiddlewaresArr.then(proxyMiddlewaresArr => {
    for (const middleware of proxyMiddlewaresArr) {
      app.use(middleware)
    }
  })
}
export {
  initialSSRDevProxy
}

export * from './proxy'
