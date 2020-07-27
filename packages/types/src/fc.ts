import { IFaaSContext } from './ctx'
import { BuildConfig } from './config'
export interface FC extends React.FC {
  fetch?: (params: any) => Promise<any>
}

export interface StaticList {
  injectCss: JSX.Element[]
  injectScript: JSX.Element[]
}

export interface LayoutProps {
  ctx?: IFaaSContext
  fetchData?: any
  config?: BuildConfig
  children?: React.ReactElement
  staticList?: StaticList
}
