import { h, createApp } from 'vue'
import { findRoute } from 'ssr-client-utils'
import { ESMFeRouteItem } from 'ssr-types'
import { createRouter } from './router'
import { createStore } from './store'

// @ts-expect-error
import feRoutes from 'ssr-temporary-routes'

declare const module: any

const clientRender = async () => {
  const store = createStore()
  const router = createRouter()

  if (window.__INITIAL_DATA__) {
    store.replaceState(window.__INITIAL_DATA__)
  }
  const App = await feRoutes[0].App()
  const app = createApp({
    render: () => h(App.default)
  })

  app.use(store)
  app.use(router)

  window.__VUE_APP__ = app

  await router.isReady()

  if (!window.__USE_SSR__) {
    // 如果是 csr 模式 则需要客户端获取首页需要的数据
    const route = findRoute<ESMFeRouteItem>(feRoutes, location.pathname)
    const { fetch } = route

    if (fetch) {
      const fetchFn = await fetch()
      await fetchFn.default({ store, router: router.currentRoute })
    }
  }

  router.beforeResolve(async (to, from, next) => {
    // 找到要进入的组件并提前执行 fetch 函数
    const route = findRoute<ESMFeRouteItem>(feRoutes, to.path)
    if (route.fetch) {
      const fetchFn = await route.fetch()
      await fetchFn.default({ store, router: to })
    }
    next()
  })
  app.mount('#app', !!window.__USE_SSR__) // 这里需要做判断 ssr/csr 来为 true/false
  if (!window.__USE_VITE__) {
    module?.hot?.accept?.() // webpack 场景下的 hmr
  }
}

export default clientRender()
