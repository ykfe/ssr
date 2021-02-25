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
const defineNodeExternals = {
  name: 'define-node-externals',
  setup (build) {
    // On every module resolved, we check if the module name should be an external
    build.onResolve({ namespace: 'file', filter: /.*/ }, (args) => {
      let moduleName = args.path.split('/')[0]
      // In case of scoped package
      if (args.path.startsWith('@')) {
        const split = args.path.split('/')
        moduleName = `${split[0]}/${split[1]}`
      }
      // Mark the module as external so it is not resolved
      if (/ssr-temporary-routes/.test(moduleName)) {
        return { path: args.path, external: true }
      }

      return null
    })
  }
}

fileArr.forEach(file => {
  const prefix = file.split('src')[0]
  const fileName = file.split('src')[1]
  let outFileName = fileName
  if (fileName.endsWith('.ts')) {
    outFileName = fileName.replace('.ts', '.js')
  } else if (fileName.endsWith('.tsx')) {
    outFileName = fileName.replace('.tsx', '.js')
  } else if (fileName.endsWith('.d.ts')) {
    outFileName = fileName.replace('.d.ts', '.js')
  }

  const esmOutFile = join(prefix, `./esm/${outFileName}`)
  const cjsOutFile = join(prefix, `./cjs/${outFileName}`)
  const platform = browserRe.test(file) ? 'browser' : 'node'
  esbuild.build({
    entryPoints: [file],
    bundle: false,
    platform,
    outfile: esmOutFile,
    format: 'esm',
    target: 'es2018',
    plugins: [nodeExternalsPlugin({
      packagePath
    }), defineNodeExternals]
  })
  esbuild.build({
    entryPoints: [file],
    bundle: false,
    platform,
    outfile: cjsOutFile,
    format: 'cjs',
    target: 'es2018',
    plugins: [nodeExternalsPlugin({
      packagePath
    }), defineNodeExternals]
  })
})
