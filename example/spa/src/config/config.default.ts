import { join } from 'path'

module.exports = appInfo => {
  const exports = {} as any

  exports.staticFile = {
    prefix: '/',
    dir: join(appInfo.baseDir, '../build')
  }
  return exports
}
