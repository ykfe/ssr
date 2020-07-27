import { FaaSContext } from '@midwayjs/faas'
import { FaasRouteItem } from './route'

export interface IFaaSContext extends FaaSContext { }

export interface Options {
  faasRoutes: FaasRouteItem[]
}
export interface IWindow extends Window {
  __USE_SSR__?: boolean
  __INITIAL_DATA__?: any
}
