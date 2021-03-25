const fs = require('fs')
const { execSync } = require('child_process')
const argv = require('./minimist')(process.argv.slice(2))

const options = {
  stdio: 'inherit'
}

const linkPackage = []

linkPackage.push('react')
linkPackage.push('react-dom')

if (argv.bootstrap) {
  let shell = 'npx concurrently "yarn"'
  const examples = fs.readdirSync('./example')
  examples.forEach(example => {
    if (example !== '.DS_Store') {
      shell += ` "cd example/${example} && yarn" `
    }
  })
  execSync(shell, options)
  execSync('yarn build:only', options)
}

if (argv.clean) {
  let shell = 'rm -rf node_modules yarn.lock **/**/cjs **/**/esm **/**/yarn.lock **/**/package-lock.json packages/**/node_modules'
  if (argv.deep) {
    shell += ' example/**/node_modules'
  }
  execSync(shell, options)
}

if (argv.link) {
  const packages = fs.readdirSync('./packages')
  let shell = 'npx concurrently'
  linkPackage.forEach(item => {
    shell += ` "cd node_modules/${item} && yarn link" ` // link react-dom 防止出现多个react实例
  })

  if (argv.vue2 || argv.vue3) {
    linkPackage.push('vue')
    const shell = `cd packages/${argv.vue2 ? 'core-vue' : 'core-vue3'}/node_modules/vue && yarn link `
    execSync(shell, options)
  }

  packages.forEach(item => {
    if (item !== '.DS_Store') {
      shell += ` "cd packages/${item} && yarn link" ` // link packages 下面所有的包
    }
  })
  const linkedPackage = packages.filter(item => item !== '.DS_Store').map(item => item === 'cli' ? 'ssr' : 'ssr-' + item)
    .concat(linkPackage).join(' ')

  const examples = fs.readdirSync('./example')
  examples.forEach(example => {
    if (example !== '.DS_Store') {
      const exampleShell = shell + `&& cd example/${example} && yarn link ${linkedPackage} && chmod 777 ./node_modules/ssr/cjs/cli.js`
      execSync(exampleShell, options)
    }
  })
}
if (argv.unlink) {
  if (argv.react) {
    linkPackage.push('react')
    linkPackage.push('react-dom')
  }

  const packages = fs.readdirSync('./packages')
  let shell = 'npx concurrently'
  linkPackage.forEach(item => {
    shell += ` "cd node_modules/${item} && yarn unlink" ` // link react-dom 防止出现多个react实例
  })
  if (argv.vue2 || argv.vue3) {
    const shell = `cd packages/${argv.vue2 ? 'core-vue' : 'core-vue3'}/node_modules/vue && yarn unlink `
    execSync(shell, options)
  }
  packages.forEach(item => {
    if (item !== '.DS_Store') {
      shell += ` "cd packages/${item} && yarn unlink" `
    }
  })
  execSync(shell, options)
}
if (argv.publishDoc) {
  const packages = fs.readdirSync('./packages')
  packages.forEach(item => {
    if (item !== '.DS_Store') {
      execSync(`cp README.md packages/${item}`, options)
    }
  })
}
