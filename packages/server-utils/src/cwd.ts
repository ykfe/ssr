import fs from 'fs'
import { join, isAbsolute } from 'path'
import { IConfig } from 'ssr-types'

const getCwd = () => {
  const cwd = process.cwd()
  if (process.env.APP_ROOT) {
    // avoid repeat cwd path
    if (!isAbsolute(process.env.APP_ROOT)) {
      return join(cwd, process.env.APP_ROOT)
    }
    return process.env.APP_ROOT
  }
  return cwd
}

const getFeDir = () => {
  // fe component folder path
  const cwd = process.cwd()
  if (process.env.FE_ROOT) {
    // avoid repeat cwd path
    if (!isAbsolute(process.env.FE_ROOT)) {
      return join(cwd, process.env.FE_ROOT)
    }
    return process.env.FE_ROOT
  }
  return join(cwd, './web')
}

const getPagesDir = () => {
  return join(getFeDir(), './pages')
}

const getVuexStoreFilePath = () => {
  return join(getFeDir(), './store')
}

const getUserConfig = (): IConfig => {
  return require(join(getCwd(), './config'))
}
const loadPlugin = () => {
  return require(join(getCwd(), './plugin'))
}
const isFaaS = () => fs.existsSync(join(getCwd(), './f.yml'))

const getLocalNodeModules = () => join(__dirname, '../../../')

const processError = (err: any) => {
  if (err) {
    console.log(err)
    process.exit(1)
  }
}
export {
  getCwd,
  getFeDir,
  getPagesDir,
  getUserConfig,
  isFaaS,
  loadPlugin,
  getLocalNodeModules,
  processError,
  getVuexStoreFilePath
}
