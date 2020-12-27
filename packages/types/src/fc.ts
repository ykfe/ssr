import { IFaaSContext } from './ctx'
import { BuildConfig } from './config'

export type Fetch = (params: any) => Promise<any>

export interface FC<T={}> extends React.FC<T> {
  fetch?: Fetch
}

export interface LayoutProps {
  ctx?: IFaaSContext
  fetchData?: any
  config?: BuildConfig
  children?: React.ReactElement
  staticList?: StaticList
}
export interface StaticList {
  injectCss: JSX.Element[]
  injectScript: JSX.Element[]
}
