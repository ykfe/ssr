// @ts-nocheck
import Vue from 'vue'
import Router from 'vue-router'

const realVue: Vue = Vue.default || Vue
const RealRouter: Router = Router.default || Router

realVue.use(RealRouter)

const feRoutes = require('ssr-temporary-routes/route')

export function createRouter (): Router {
  return new RealRouter({
    mode: 'history',
    routes: feRoutes
  })
}
