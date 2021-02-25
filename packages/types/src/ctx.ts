import Koa from 'koa'
import Express from 'express'
import { FaaSHTTPContext } from '@midwayjs/faas-typings'
import { Action } from './component'

interface ExpressContext {
  request: Express.Request
  response: Express.Response
}

export type ISSRContext<T={}> = (Koa.Context|ExpressContext|FaaSHTTPContext) & T

export interface Options {
  mode?: string
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
