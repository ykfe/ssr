import fs from 'fs'
import http from 'http'
import { promisify } from 'util'

const promisifyFsReadDir = promisify(fs.readdir)

interface DefaultVal {
  [key: string]: string
}
const getPromisify = async <T = DefaultVal>(url: string): Promise<T> => {
  return await new Promise((resolve, reject) => {
    setTimeout(() => {
      reject(new Error(`request ${url} timeout`))
    }, 3000)
    http.get(url, res => {
      if (res.statusCode! < 200 || res.statusCode! >= 300) {
        return reject(new Error(`statusCode=${res.statusCode}`))
      }
      let body: Buffer[] = []
      res.on('data', function (chunk) {
        body.push(chunk)
      })
      res.on('end', function () {
        try {
          body = JSON.parse(Buffer.concat(body).toString())
          resolve(body as any)
        } catch (e) {
          reject(e)
        }
      })
    })
  })
}
export {
  promisifyFsReadDir,
  getPromisify
}
