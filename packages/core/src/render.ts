import { renderToString } from 'react-dom/server'
import { getCwd, findRoute, parseYml, parseRoutesFromYml } from 'ssr-server-utils'
import { IFaaSContext, FaasRouteItem } from 'ssr-types'

const debug = require('debug')('ssr:render')
const isDev = process.env.NODE_ENV !== 'production'
const ymlContent = isDev ? parseYml('./f.yml') : parseYml('./f.origin.yml')
const faasRoutes = parseRoutesFromYml(ymlContent)

const render = async (ctx: IFaaSContext) => {
  const cwd = getCwd()
  const isLocal = process.env.NODE_ENV === 'development' || ctx.env === 'local' // 标志非正式环境

  const faasRouteItem = findRoute<FaasRouteItem>(faasRoutes, ctx.req.path)
  const { funcName } = faasRouteItem

  const abFilePath = `${cwd}/build/${funcName}/server/Page.server.js`

  debug(`render func ${funcName} for ${ctx.req.path} and use ${abFilePath}`)
  if (isLocal) {
    // clear cache in development environment
    delete require.cache[abFilePath]
  }

  const serverRender = require(abFilePath).default
  const serverRes = await serverRender(ctx, {
    faasRoutes: faasRoutes
  })

  const htmlStr: string = renderToString(serverRes)
  ctx.type = 'text/html'
  return '<!DOCTYPE html>' + htmlStr
}

export {
  render
}
