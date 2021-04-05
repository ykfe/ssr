// @ts-nocheck
import * as Vue from 'vue'
import * as Router from 'vue-router'

// @ts-expect-error
import feRoutes from 'ssr-temporary-routes'

const realVue: Vue = Vue.default || Vue
const RealRouter: Router = Router.default || Router

realVue.use(RealRouter)

export function createRouter (): Router {
  return new RealRouter({
    mode: 'history',
    routes: feRoutes
  })
}
