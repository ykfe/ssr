import { promisify } from 'util'
import webpack from 'webpack'

const webpackPromisify = promisify<webpack.Configuration, webpack.Stats>(webpack)

export {
  webpackPromisify
}
