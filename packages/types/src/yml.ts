import  yargs from 'yargs'
import { FeRouteItem, FaasRouteItem } from './route'

export type Argv = yargs.Arguments<{ yml?: Yml, faasRoutes?: FaasRouteItem[], feRoutes?: FeRouteItem[], mpa?: boolean, tencent?: boolean} >

export interface Yml {
  service: string
  provider: {
    name: string
    runtime: string
  }
  functions: {
    [index: string]: {
      handler: string
      render: Render<{}>
      events: Events[]
    }
  }
}

export type Render<T> = T & {
  funcName: string
  component: string
  layout?: string
  fetch?: string
  mode: string
  injectScript?: string[]
  injectCss?: string[]
}
interface Events {
  apigw?: {
    path: string
    method: string[]
  }
  http?: {
    path: string
    method: string[]
  }
}
