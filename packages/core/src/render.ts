import { resolve } from 'path'
import { renderToString } from 'react-dom/server'
import { getUserConfig, getCwd, parseYml, parseRoutesFromYml } from 'ssr-server-utils'
import { IFaaSContext } from 'ssr-types'

const { serverFramework, isDev, chunkName } = getUserConfig()
const cwd = getCwd()
const debug = require('debug')('ssr:render')
const isLocal = isDev ?? process.env.NODE_ENV !== 'production'
const serverFile = resolve(cwd, `./build/server/${chunkName ?? 'Page'}.server.js`)

async function render (ctx: IFaaSContext) {
  if (isDev) {
    // clear cache in development environment
    delete require.cache[serverFile]
  }
  if (typeof ctx.response.type === 'function') {
    ctx.response.type('.html')
  } else {
    ctx.response.type = 'text/html'
  }
  return await judgeServerFrameWork(ctx)
}
const judgeServerFrameWork = async (ctx: IFaaSContext) => {
  const start = Date.now()
  let htmlStr = '<h1>Error</h1>'

  try {
    if (!serverFramework) {
      // 如果没有指定服务端框架 则默认以 midway-faaS 框架运行
      htmlStr = await renderWithFaaS(ctx)
    } else {
      // 针对传统 Node.js 应用场景
      // htmlStr = await renderWithNode(ctx)
    }
  } catch (error) {
    htmlStr = `<h1>${error}</h1>`
  }
  debug(`Page rendering spend ${Date.now() - start}ms`)
  return htmlStr
}

const renderWithFaaS = async (ctx: IFaaSContext) => {
  const ymlContent = isLocal ? parseYml('./f.yml') : parseYml('./f.origin.yml')
  const faasRoutes = parseRoutesFromYml(ymlContent)
  const serverRender = require(serverFile).default
  const serverRes = await serverRender(ctx, {
    faasRoutes: faasRoutes
  })

  const htmlStr: string = renderToString(serverRes)
  return '<!DOCTYPE html>' + htmlStr
}

export {
  render
}
