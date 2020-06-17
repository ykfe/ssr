import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { BrowserRouter, Route, Switch } from 'react-router-dom'
import { wrapComponent, wrapLayout, FeRouteItem, IWindow } from 'ssr-client-utils'

declare const window: IWindow
declare const module: any
declare const __isBrowser__: boolean
declare const prefix: string

const feRoutes: FeRouteItem[] = require('ssr-cache/route')

const clientRender = async (): Promise<void> => {
  // 客户端渲染||hydrate
  ReactDOM[window.__USE_SSR__ ? 'hydrate' : 'render'](
    <BrowserRouter>
      <Switch>
        {
          // 使用高阶组件wrapComponent使得csr首次进入页面以及csr/ssr切换路由时调用getInitialProps
          feRoutes.map((item: FeRouteItem) => {
            const { fetch, layout, component, path } = item
            const Layout = wrapLayout(layout, __isBrowser__)
            // @ts-ignore
            component.fetch = fetch
            // @ts-ignore
            const WrappedComponent = wrapComponent(component)
            return <Route exact={true} key={prefix ? `/${prefix}${path}` : path} path={path} render={() => <Layout key={location.pathname} ><WrappedComponent /></Layout>} />
          })
        }
      </Switch>
    </BrowserRouter>
    , document.getElementById('app'))
  if (process.env.NODE_ENV === 'development' && module.hot) {
    module.hot.accept()
  }
}

export default clientRender()
