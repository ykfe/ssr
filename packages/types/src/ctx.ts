import * as Koa from 'koa'
import * as Express from 'express'
import { FaaSHTTPContext } from '@midwayjs/faas-typings'
import { FaasRouteItem } from './route'
import { Action } from './component'

interface ExpressContext {
  req: Express.Request
  res: Express.Response
  request: Express.Request
  response: Express.Response
}
export type IFaaSContext<T={}> = (Koa.Context|ExpressContext|FaaSHTTPContext) & T

export interface Options {
  faasRoutes: FaasRouteItem[]
}
export interface IWindow extends Window {
  __USE_SSR__?: boolean
  __INITIAL_DATA__?: any
  STORE_CONTEXT?: any
}

export interface IGlobal extends NodeJS.Global {
  window: {
    __USE_SSR__?: IWindow['__USE_SSR__']
    __INITIAL_DATA__?: IWindow['__INITIAL_DATA__']
    STORE_CONTEXT?: IWindow['STORE_CONTEXT']
  }
}

export interface IContext<T=any> {
  state?: T
  dispatch?: React.Dispatch<Action>
}
