// @ts-nocheck

import  fs from 'fs'
import  path from 'path'

const contains = function contains (arr, val) {
  return arr && arr.indexOf(val) !== -1
}

const atPrefix = new RegExp('^@', 'g')

const readDir = function readDir (dirName: string): string[] {
  if (!fs.existsSync(dirName)) {
    return []
  }

  try {
    return fs.readdirSync(dirName).map(function (module) {
      if (atPrefix.test(module)) {
        // reset regexp
        atPrefix.lastIndex = 0
        try {
          return fs.readdirSync(path.join(dirName, module)).map(function (scopedMod) {
            return module + '/' + scopedMod
          })
        } catch (e) {
          return [module]
        }
      }
      return module
    }).reduce(function (prev, next) {
      return prev.concat(next)
    }, [])
  } catch (e) {
    return []
  }
}

const readFromPackageJson = function readFromPackageJson (options) {
  if (typeof options !== 'object') {
    options = {}
  }
  // read the file
  let packageJson
  try {
    const fileName = options.fileName || 'package.json'
    const packageJsonString = fs.readFileSync(path.join(process.cwd(), './' + fileName), 'utf8')
    packageJson = JSON.parse(packageJsonString)
  } catch (e) {
    return []
  }
  // sections to search in package.json
  let sections = ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies']
  if (options.include) {
    sections = [].concat(options.include)
  }
  if (options.exclude) {
    sections = sections.filter(function (section) {
      return ![].concat(options.exclude).includes(section)
    })
  }
  // collect dependencies
  const deps = {}
  sections.forEach(function (section) {
    Object.keys(packageJson[section] || {}).forEach(function (dep) {
      deps[dep] = true
    })
  })
  return Object.keys(deps)
}

const containsPattern = function containsPattern (arr, val) {
  return arr && arr.some(function (pattern) {
    if (pattern instanceof RegExp) {
      return pattern.test(val)
    } else if (typeof pattern === 'function') {
      return pattern(val)
    } else {
      return pattern === val
    }
  })
}

export {
  readFromPackageJson,
  readDir,
  containsPattern,
  contains
}
