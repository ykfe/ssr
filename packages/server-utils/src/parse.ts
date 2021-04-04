import { promises as fs } from 'fs'
import { resolve, join } from 'path'
import * as Shell from 'shelljs'
import { ParseFeRouteItem } from 'ssr-types'
import { getCwd, getPagesDir, getFeDir, accessFile } from './cwd'
import { loadConfig } from './loadConfig'

const debug = require('debug')('ssr:parse')
const { dynamic, prefix } = loadConfig()
const pageDir = getPagesDir()
const cwd = getCwd()

const parseFeRoutes = async () => {
  // vue 场景也可能使用 tsx 文件，所以这里需要做判断
  const vueLayout = await accessFile(join(getFeDir(), './components/layout/index.vue'))
  const vueApp = await accessFile(join(getFeDir(), './components/layout/App.vue'))
  const isVue = require(join(cwd, './package.json')).dependencies.vue
  const isVue3 = /^.?3/.test(isVue)
  if (!isVue3 && process.env.BUILD_TOOL === 'vite') {
    console.log('vite模式目前暂时只支持vue3,当前--vite指令无效, vue2和react将会在下一个版本支持，敬请期待')
    process.env.BUILD_TOOL = 'webpack'
  }
  // const isVite = process.env.BUILD_TOOL === 'vite'

  const defaultLayout = `@/components/layout/index.${vueLayout ? 'vue' : 'tsx'}`

  try {
    await fs.access(join(cwd, './node_modules/ssr-temporary-routes'))
  } catch (error) {
    Shell.mkdir(join(cwd, './node_modules/ssr-temporary-routes'))
  }

  let routes = ''
  const declaretiveRoutes = (await accessFile(join(getFeDir(), './route.js')) || await accessFile(join(getFeDir(), './route.ts'))) // 是否存在自定义路由

  if (!declaretiveRoutes) {
    // 根据目录结构生成前端路由表
    const pathRecord = [''] // 路径记录
    const route: ParseFeRouteItem = {
      layout: `require('${defaultLayout}').default`
    }
    if (isVue) {
      const defaultApp = `@/components/layout/App.${vueApp ? 'vue' : 'tsx'}`
      route.App = `require('${defaultApp}').default`
    }
    const arr = await renderRoutes(pageDir, pathRecord, route)
    debug('The result that parse web folder to routes is: ', arr)
    routes = `${isVue3 ? 'export default' : 'module.exports='} ${JSON.stringify(arr)
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

    const sourceRoutes = routes
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

        // vite模式特殊处理为ESM
        if (isVue3) {
          re.lastIndex = 0
          routes = routes.replace(/"layout": (require\('(.+?)'\).default)/g, (global, m1, m2) => {
            const currentWebpackChunkName = re.exec(sourceRoutes)![2]
            return `"layout":  __isBrowser__ ? () => import(/* webpackChunkName: "${currentWebpackChunkName}" */ '${m2.replace(/\^/g, '"')}') : require('${m2.replace(/\^/g, '"')}').default`
          })
          re.lastIndex = 0
          routes = routes.replace(/"App": (require\('(.+?)'\).default)/g, (global, m1, m2) => {
            const currentWebpackChunkName = re.exec(sourceRoutes)![2]
            return `"App":  __isBrowser__ ? () => import(/* webpackChunkName: "${currentWebpackChunkName}" */ '${m2.replace(/\^/g, '"')}') : require('${m2.replace(/\^/g, '"')}').default`
          })
          re.lastIndex = 0
          routes = routes.replace(/"fetch": (require\('(.+?)'\).default)/g, (global, m1, m2) => {
            const currentWebpackChunkName = re.exec(sourceRoutes)![2]
            return `"fetch": __isBrowser__ ? () => import(/* webpackChunkName: "${currentWebpackChunkName}" */ '${m2.replace(/\^/g, '"')}') : require('${m2.replace(/\^/g, '"')}').default`
          })
        }
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
    routes = (await fs.readFile(join(getFeDir(), './route.js'))).toString()
  }

  await fs.writeFile(resolve(cwd, './node_modules/ssr-temporary-routes/route.js'), routes)
  const packageJsonStr = `{
    "name": "ssr-temporary-routes",
    "module": "route.js"
  }`
  await fs.writeFile(resolve(cwd, './node_modules/ssr-temporary-routes/package.json'), packageJsonStr)
}

const renderRoutes = async (pageDir: string, pathRecord: string[], route: ParseFeRouteItem): Promise<ParseFeRouteItem[]> => {
  let arr: ParseFeRouteItem[] = []
  const pagesFolders = await fs.readdir(pageDir)
  const prefixPath = pathRecord.join('/')
  const aliasPath = `@/pages${prefixPath}`
  const routeArr: ParseFeRouteItem[] = []
  const fetchExactMatch = pagesFolders.filter(p => p.includes('fetch'))
  for (const pageFiles of pagesFolders) {
    const abFolder = join(pageDir, pageFiles)
    const isDirectory = (await fs.stat(abFolder)).isDirectory()
    if (isDirectory) {
      // 如果是文件夹则递归下去, 记录路径
      pathRecord.push(pageFiles)
      const childArr = await renderRoutes(abFolder, pathRecord, Object.assign({}, route))
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
        // fetch文件数量>=2 启用完全匹配策略
        if (fetchExactMatch.length >= 2) {
          const fetchPageFiles = `fetch${pageFiles.replace('render', '').replace('.vue', '.ts')}`
          if (fetchExactMatch.includes(fetchPageFiles)) {
            route.fetch = `require('${aliasPath}/${fetchPageFiles}').default`
          }
        }
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
      routeArr.push({ ...route })
    }
  }

  routeArr.forEach((r) => {
    if (r.path?.includes('index')) {
      // /index 映射为 /
      r.path = r.path.replace('index', '')
    }

    if (r.path && prefix) {
      // 统一添加公共前缀
      r.path = `/${prefix}${r.path}`
    }
    r.path && arr.push(r)
  })

  return arr
}

const getDynamicParam = (url: string) => {
  return url.split('$').filter(r => r !== 'render' && r !== '').map(r => r.replace(/\.[\s\S]+/, '')).join('/:')
}

export {
  parseFeRoutes
}
