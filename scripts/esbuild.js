const fs = require('fs')
const { join } = require('path')
const esbuild = require('esbuild')
const { nodeExternalsPlugin } = require('esbuild-node-externals')

const cwd = process.cwd()
const fileArr = []
const readPackages = (dir, prefix) => {
  dir.forEach(item => {
    if (item !== '.DS_Store' && item !== 'node_modules') {
      if (fs.statSync(join(prefix, item)).isDirectory()) {
        readPackages(fs.readdirSync(join(prefix, item)), join(prefix, item))
      } else {
        if (prefix.match('src') && (item.endsWith('.ts') || item.endsWith('.d.ts'))) {
          fileArr.push(join(prefix, item))
        }
      }
    }
  })
}

readPackages(fs.readdirSync('./packages'), join(process.cwd(), './packages'))

const browserRe = /client-utils/

const packagePath = [join(cwd, './package.json')]

fs.readdirSync('./packages').forEach(item => {
  if (item !== '.DS_Store') {
    packagePath.push(join(cwd, `./packages/${item}/package.json`))
  }
})


fileArr.forEach(file => {
  const prefix = file.split('src')[0]
  const fileName = file.split('/')[file.split('/').length-1]
  const esmOutFile = join(prefix, `./esm-esbuild/${fileName}`)
  const cjsOutFile = join(prefix, `./cjs-esbuild/${fileName}`)
  esbuild.build({
    entryPoints: [file],
    bundle: true,
    platform: browserRe.test(file) ? 'browser' : 'node',
    outfile: esmOutFile,
    format: 'esm',
    target: 'es2018',
    plugins: [nodeExternalsPlugin({
      packagePath
    })]
  })
  esbuild.build({
    entryPoints: [file],
    bundle: true,
    platform: browserRe.test(file) ? 'browser' : 'node',
    outfile: cjsOutFile,
    format: 'cjs',
    target: 'es2018',
    plugins: [nodeExternalsPlugin({
      packagePath
    })]
  })
})
