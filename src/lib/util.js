const execa = require('execa')
const fs = require('fs')
const path = require('path')
const { version } = require('../../package.json')

const pm2 = path.join(require.resolve('pm2', { paths: [path.join(__dirname, 'node_modules')] }), '../../.bin/pm2')

const pm2Start = async (networkDir, script, name, env = {}, pm2Args = []) => {
  env.PM2_HOME = path.join(networkDir, '.pm2/')
  const parsedPm2Args = pm2Args.map(arg => arg.split('pm2')[1] || arg).join(' ')
  const execaCmd = `${pm2} start ${script} --name="${name}" ${parsedPm2Args}`
  console.log('pm2Start', execaCmd)
  await execa.command(execaCmd, { cwd: networkDir, env, stdio: [0, 1, 2] })
}

const pm2Stop = async (networkDir, arg, env = {}) => {
  env.PM2_HOME = path.join(networkDir, '.pm2/')
  await execa.command(`${pm2} stop ${arg}`, { cwd: networkDir, env, stdio: [0, 1, 2] })
}

const pm2Kill = async (networkDir, env = {}) => {
  env.PM2_HOME = path.join(networkDir, '.pm2/')
  await execa.command(`${pm2} kill`, { cwd: networkDir, env, stdio: [0, 1, 2] })
}

const pm2Reset = async (arg, env = {}) => {
  env.PM2_HOME = path.join(networkDir, '.pm2/')
  await execa.command(`${pm2} reset ${arg}`, { env, stdio: [0, 1, 2] })
}

const pm2Del = async (arg, env = {}) => {
  env.PM2_HOME = path.join(networkDir, '.pm2/')
  await execa.command(`${pm2} del ${arg}`, { env, stdio: [0, 1, 2] })
}

const pm2List = async (networkDir, env = {}) => {
  env.PM2_HOME = path.join(networkDir, '.pm2/')
  await execa.command(`${pm2} list`, { cwd: networkDir, env, stdio: [0, 1, 2] })
}

const pm2Exec = async (networkDir, arg, env = {}) => {
  env.PM2_HOME = path.join(networkDir, '.pm2/')
  await execa.command(`${pm2} ${arg}`, { cwd: networkDir, env, stdio: [0, 1, 2] })
}

const checkVersion = (v1, v2) => {
  let major1 = v1.split(".")[0]
  let major2 = v2.split(".")[0]
  if (major1 !== major2) {
    console.log('Error: Network configuration was created with a different major version of shardus network tool.')
    return false
  }
  return true
}

const checkNetworkFolder = (networkPath, silent) => {
  const networkConfigPath = path.join(networkPath, 'network-config.json')
  if (fs.existsSync(networkConfigPath)) {
    const networkConfig = JSON.parse(fs.readFileSync(networkConfigPath))
    let isVersionValid = checkVersion(networkConfig['shardus-network-version'], version)
    if (!isVersionValid) return false
  } else {
    if (!silent) {
      console.log('Error: Cannot find a valid network-config.json file on current directory.')
    }
    return false
  }
  return true
}

module.exports = { pm2Start, pm2Stop, pm2Kill, pm2Reset, pm2Del, pm2List, pm2Exec, checkNetworkFolder }
