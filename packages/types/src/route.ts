import { IFaaSContext } from './ctx'
import { LayoutProps } from './fc'

export interface ProvisionalFeRouteItem {
  path?: string
  layout: string
  fetch?: string
  component?: string
}

export interface FeRouteItem<T = {}> {
  path: string
  layout: React.FC<LayoutProps>
  fetch?: (ctx: IFaaSContext) => Promise<any>
  component?: React.FC<T>
}

export interface FaasRouteItem {
  path: string
  mode: string
  funcName: string
}
