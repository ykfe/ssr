const fs = require('fs')
const { join } = require('path')
const esbuild = require('esbuild')

const cwd = process.cwd()
const fileArr = []
const readPackages = (dir, prefix) => {
  dir.forEach(item => {
    if (item !== '.DS_Store' && item !== 'node_modules') {
      if (fs.statSync(join(prefix, item)).isDirectory()) {
        readPackages(fs.readdirSync(join(prefix, item)), join(prefix, item))
      } else {
        if (prefix.match('src')) {
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

const watch = process.argv.includes('--watch') ? {
  onRebuild (error, result) {
    if (error) console.error('watch build failed:', error)
    else console.error('watch build succeeded:', result)
  }
} : false

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
  } else {
    throw new Error(`${fileName} extension is undefined`)
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
    watch
  })
  esbuild.build({
    entryPoints: [file],
    bundle: false,
    platform,
    outfile: cjsOutFile,
    format: 'cjs',
    target: 'es2018',
    watch
  })
})
