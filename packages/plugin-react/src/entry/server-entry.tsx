import React from 'react'
import { StaticRouter } from 'react-router-dom'
import { findRoute, getManifest, logGreen } from 'ssr-server-utils'
import { FeRouteItem, ISSRContext, IGlobal, IConfig } from 'ssr-types'
import { serverContext } from './create-context'

const feRoutes: FeRouteItem[] = require('ssr-temporary-routes/route')
declare const global: IGlobal

const serverRender = async (ctx: ISSRContext, config: IConfig): Promise<React.ReactElement> => {
  const { staticPrefix, cssOrder, jsOrder, dynamic, mode } = config
  global.window = global.window ?? {} // 防止覆盖上层应用自己定义的 window 对象
  const path = ctx.request.path // 这里取 pathname 不能够包含 queyString
  const { window } = global
  const routeItem = findRoute<FeRouteItem<any>>(feRoutes, path)

  let dynamicCssOrder = cssOrder

  if (dynamic) {
    dynamicCssOrder = cssOrder.concat([`${routeItem.webpackChunkName}.css`])
  }
  const manifest = await getManifest()
  const injectCss = dynamicCssOrder.map(css => `${staticPrefix}${manifest[css]}`)
    .map(item => <link rel='stylesheet' key={item} href={item} />)
  const injectScript = jsOrder.map(js => `${staticPrefix}${manifest[js]}`)
    .map(item => <script key={item} src={item} />)

  const staticList = {
    injectCss,
    injectScript
  }
  if (!routeItem) {
    throw new Error(`With request url ${path} Component is Not Found`)
  }

  const Layout = routeItem.layout
  const Component = routeItem.component
  if (mode === 'csr' || ctx.request.query?.csr) {
    // 根据 mode 和 query 来决定当前渲染模式
    logGreen(`Current path ${path} use csr render mode`)
    const Context = serverContext({}) // csr 不需要在服务端获取数据
    window.STORE_CONTEXT = Context
    return <StaticRouter><Layout ctx={ctx} staticList={staticList} config={config}></Layout></StaticRouter>
  }
  const fetchData = routeItem.fetch ? await routeItem.fetch(ctx) : {}
  const Context = serverContext(fetchData) // 服务端需要每个请求创建新的独立的 context
  window.STORE_CONTEXT = Context // 为每一个新的请求都创建一遍context并且覆盖window上的属性，使得无需通过props层层传递读取

  return (
    <StaticRouter>
      <Context.Provider value={{ state: fetchData }}>
        <Layout ctx={ctx} config={config} staticList={staticList}>
          <Component />
        </Layout>
      </Context.Provider>
    </StaticRouter>
  )
}

export default serverRender
