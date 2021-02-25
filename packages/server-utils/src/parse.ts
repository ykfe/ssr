import  fs from 'fs'
import { resolve, join } from 'path'
import  Yaml from 'js-yaml'
import  Shell from 'shelljs'
import { Yml, FaasRouteItem, ParseFeRouteItem } from 'ssr-types'
import { promisifyFsReadDir } from './promisify'
import { getCwd, getPagesDir, getFeDir, loadPlugin } from './cwd'
import { loadConfig } from './loadConfig'

const debug = require('debug')('ssr:parse')
const { cloudIDE, dynamic, prefix } = loadConfig()
const pageDir = getPagesDir()
const feDir = getFeDir()
const cwd = getCwd()

const parseYml = (path: string): Yml => {
  const cwd = getCwd()
  const yamlPath = resolve(cwd, path)
  const yamlContent = fs.readFileSync(yamlPath, 'utf-8').toString()
  // tslint:disable-next-line
  const result = Yaml.safeLoad(yamlContent) as Yml
  return result
}

const parseRoutesFromYml = (yamlContent: Yml) => {
  const routes: FaasRouteItem[] = []

  for (const funcName in yamlContent.functions) {
    const func = yamlContent.functions[funcName]
    func.render && func.events.forEach(event => {
      const http = cloudIDE ? event.apigw : event.http
      if (http) {
        routes.push({
          path: http.path,
          ...func.render,
          funcName
        })
      }
    })
  }
  return routes
}

const hasDeclaretiveRoutes = () => {
  return fs.existsSync(join(getFeDir(), './route.js'))
}
const parseFeRoutes = async () => {
  const { clientPlugin } = loadPlugin()
  const isVue = clientPlugin.name === 'plugin-vue'
  const defaultLayout = join(feDir, `./components/layout/index.${isVue ? 'vue' : 'tsx'}`)
  const defaultApp = join(feDir, './components/layout/App.vue')

  if (!fs.existsSync(join(cwd, './node_modules/ssr-temporary-routes'))) {
    Shell.mkdir(`${cwd}/node_modules/ssr-temporary-routes`)
  }
  let routes = ''
  if (!hasDeclaretiveRoutes()) {
    // 根据目录结构生成前端路由表
    const pathRecord = [''] // 路径记录
    const route: ParseFeRouteItem = {
      layout: `require('${defaultLayout}').default`
    }
    if (isVue) {
      route.App = `require('${defaultApp}').default`
    }
    const arr = await renderRoutes(pageDir, isVue, pathRecord, route)
    debug('The result that parse web folder to routes is: ', arr)
    routes = `module.exports =${JSON.stringify(arr)
        .replace(/"layout":("(.+?)")/g, (global, m1, m2) => {
          return `"layout": ${m2.replace(/\^/g, '"')}`
        })
        .replace(/"App":("(.+?)")/g, (global, m1, m2) => {
          return `"App": ${m2.replace(/\^/g, '"')}`
        })
        .replace(/"fetch":("(.+?)")/g, (global, m1, m2) => {
          return `"fetch": ${m2.replace(/\^/g, '"')}`
        })
        }`
    if (!dynamic) {
      // 如果禁用路由分割则无需引入 react-loadable
      routes = routes.replace(/"component":("(.+?)")/g, (global, m1, m2) => {
        return `"component": require('${m2.replace(/\^/g, '"')}').default`
      })
    } else {
      const re = /"webpackChunkName":("(.+?)")/g
      if (isVue) {
        routes = routes.replace(/"component":("(.+?)")/g, (global, m1, m2) => {
          const currentWebpackChunkName = re.exec(routes)![2]
          return `"component":  __isBrowser__ ? () => import(/* webpackChunkName: "${currentWebpackChunkName}" */ '${m2.replace(/\^/g, '"')}') : require('${m2.replace(/\^/g, '"')}').default`
        })
      } else {
        routes = routes.replace(/"component":("(.+?)")/g, (global, m1, m2) => {
          const currentWebpackChunkName = re.exec(routes)![2]
          return `"component":  __isBrowser__ ? require('react-loadable')({
            loader: () => import(/* webpackChunkName: "${currentWebpackChunkName}" */ '${m2.replace(/\^/g, '"')}'),
            loading: function Loading () {
              return require('react').createElement('div')
            }
          }) : require('${m2.replace(/\^/g, '"')}').default`
        })
      }
    }
  } else {
    // 使用了声明式路由
    routes = fs.readFileSync(join(getFeDir(), './route.js')).toString()
  }

  fs.writeFileSync(resolve(cwd, './node_modules/ssr-temporary-routes/route.js'), routes)
}

const renderRoutes = async (pageDir: string, isVue: boolean, pathRecord: string[], route: ParseFeRouteItem): Promise<ParseFeRouteItem[]> => {
  let arr: ParseFeRouteItem[] = []
  const pagesFolders = await promisifyFsReadDir(pageDir)
  const prefixPath = pathRecord.join('/')
  const aliasPath = `@/pages${prefixPath}`
  for (const pageFiles of pagesFolders) {
    const abFolder = join(pageDir, pageFiles)
    if (fs.statSync(abFolder).isDirectory()) {
      // 如果是文件夹则递归下去, 记录路径
      pathRecord.push(pageFiles)
      const childArr = await renderRoutes(abFolder, isVue, pathRecord, Object.assign({}, route))
      pathRecord.pop() // 回溯
      arr = arr.concat(childArr)
    } else {
      // 拿到具体的文件
      if (pageFiles.includes('render')) {
        /* /news */
        route.path = `${prefixPath}`
        route.component = `${aliasPath}/${pageFiles}`
      }

      if (pageFiles.includes('render$')) {
        /* /news/:id */
        route.path = `${prefixPath}/:${getDynamicParam(pageFiles)}`
        route.component = `${aliasPath}/${pageFiles}`
      }

      if (/render\$[\s\S]+\$/.test(pageFiles)) {
        /* /news:id? */
        route.path = `${prefixPath}/:${getDynamicParam(pageFiles)}?`
        route.component = `${aliasPath}/${pageFiles}`
      }
      if (pageFiles.includes('fetch')) {
        route.fetch = `require('${aliasPath}/${pageFiles}').default`
      }
      debug(`parse "${aliasPath.replace(cwd, '')}" to "${route.path}" \n`)
      if (dynamic) {
        let webpackChunkName = pathRecord.join('-')
        if (webpackChunkName.startsWith('-')) {
          webpackChunkName = webpackChunkName.replace('-', '')
        }
        route.webpackChunkName = webpackChunkName
      }
    }
  }

  if (route.path?.includes('index')) {
    // /index 映射为 /
    route.path = route.path.replace('index', '')
  }

  if (route.path && prefix) {
    // 统一添加公共前缀
    route.path = prefix ? `/${prefix}${route.path}` : route.path
  }
  route.path && arr.push(route)
  return arr
}

const getDynamicParam = (url: string) => {
  return url.split('$')[1].replace(/\.[\s\S]+/, '')
}

const checkDependencies = () => {
  const cwd = getCwd()
  if (!fs.existsSync(join(cwd, './node_modules'))) {
    throw new Error(`node_modules is not found in ${cwd}, please run yarn or npm install`)
  }
}
export {
  parseYml,
  parseRoutesFromYml,
  parseFeRoutes,
  checkDependencies
}
