// @ts-nocheck
import pathToRegexp from 'path-to-regexp'

const debug = require('debug')('ssr:render')
const cache = {}
const cacheLimit = 10000
let cacheCount = 0

function compilePath (path, options) {
  const cacheKey = `${options.end}${options.strict}${options.sensitive}`
  const pathCache = cache[cacheKey] || (cache[cacheKey] = {})

  if (pathCache[path]) return pathCache[path]

  const keys = []
  const regexp = pathToRegexp(path, keys, options)
  const result = { regexp, keys }

  if (cacheCount < cacheLimit) {
    pathCache[path] = result
    cacheCount++
  }

  return result
}

function matchPath (pathname, options = {}) {
  if (typeof options === 'string' || Array.isArray(options)) {
    options = { path: options }
  }

  const { path, exact = false, strict = false, sensitive = false } = options

  const paths = [].concat(path)

  return paths.reduce((matched, path) => {
    if (!path && path !== '') return null
    if (matched) return matched

    const { regexp, keys } = compilePath(path, {
      end: exact,
      strict,
      sensitive
    })
    const match = regexp.exec(pathname)

    if (!match) return null

    const [url, ...values] = match
    const isExact = pathname === url

    if (exact && !isExact) return null

    return {
      path, // the path used to match
      url: path === '/' && url === '' ? '/' : url, // the matched portion of the URL
      isExact, // whether or not we matched exactly
      params: keys.reduce((memo, key, index) => {
        memo[key.name] = values[index]
        return memo
      }, {})
    }
  }, null)
}

function findRoute<T extends {path: string}> (Routes: T[], path: string): T {
  // 根据请求的path来匹配到对应的Component
  const route = Routes.find(route => matchPath(path, route) && matchPath(path, route).isExact)
  debug(`With path "${path}" find Route: `, route)
  return route
}

export {
  findRoute
}
