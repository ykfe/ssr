const fs = require('fs')
const { execSync } = require('child_process')

const options = {
  stdio: 'inherit'
}
if (process.argv.includes('--bootstrap')) {
  execSync('npx concurrently "yarn && yarn build:only"  "cd example/serverless-react-ssr && yarn"', options)
}
if (process.argv.includes('--clean')) {
  execSync('rm -rf yarn.lock package-lock.json node_modules example/serverless-react-ssr/node_modules example/serverless-react-ssr/yarn.lock example/serverless-react-ssr/package-lock.json packages/**/cjs packages/**/esm packages/**/node_modules', options)
}
if (process.argv.includes('--link')) {
  const packages = fs.readdirSync('./packages')
  let shell = 'npx concurrently'
  shell += ' "cd node_modules/react && yarn link" ' // link react-dom 防止出现多个react实例
  shell += ' "cd node_modules/react-dom && yarn link" '
  packages.forEach(item => {
    if (item !== '.DS_Store') {
      shell += ` "cd packages/${item} && yarn link" ` // 在 example 中 link packages 下面所有的包
    }
  })
  const linkedPackage = packages.filter(item => item !== '.DS_Store').map(item => item === 'cli' ? 'ssr' : 'ssr-' + item).join(' ')
  shell += `&& cd example/serverless-react-ssr && yarn link ${linkedPackage} && yarn link react && yarn link react-dom && chmod 777 ./node_modules/.bin/ssr`
  execSync(shell, options)
}
if (process.argv.includes('--unlink')) {
  const packages = fs.readdirSync('./packages')
  let shell = 'npx concurrently'
  shell += ' "cd node_modules/react && yarn unlink" '
  shell += ' "cd node_modules/react-dom && yarn unlink" '
  packages.forEach(item => {
    if (item !== '.DS_Store') {
      shell += ` "cd packages/${item} && yarn unlink" `
    }
  })
  execSync(shell, options)
}
