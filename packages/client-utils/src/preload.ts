import pathToRegexp from 'path-to-regexp'
import { FeRouteItem } from 'ssr-types'

const preloadComponent = async (Routes: FeRouteItem[]) => {
  // 预加载当前页面对应的组件
  const pathName = location.pathname
  for (const route of Routes) {
    const { component, path } = route

    let activeComponent = component
    console.log(pathToRegexp(path).test(pathName))
    if (activeComponent.preload && pathToRegexp(path).test(pathName)) {
      // 针对 react-loadble 包裹的组件
      activeComponent = (await activeComponent.preload()).default
    }
    route.component = activeComponent
  }
  return Routes
}

export { preloadComponent }
