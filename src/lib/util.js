const execa = require('execa')
const fs = require('fs')
const path = require('path')
const shell = require('shelljs')
const { version } = require('../../package.json')
const PM2_HOME = path.join(process.cwd(), '.pm2/')

const pm2 = path.join(require.resolve('pm2', { paths: [path.join(__dirname, 'node_modules')] }), '../../.bin/pm2')

const pm2Start = async (script, name, env = {}, pm2Args = []) => {
  env.PM2_HOME = PM2_HOME
  const parsedPm2Args = pm2Args.map(arg => arg.split('pm2')[1] || arg).join(' ')
  const execaCmd = `${pm2} start ${script} --name="${name}" ${parsedPm2Args}`
  console.log('pm2Start', execaCmd)
  await execa.command(execaCmd, { env, stdio: [0, 1, 2] })
}

const pm2Stop = async (networkDir, arg, env = {}) => {
  env.PM2_HOME = PM2_HOME
  await execa.command(`${pm2} stop ${arg}`, { cwd: networkDir, env, stdio: [0, 1, 2] })
}

const pm2Kill = async (networkDir, env = {}) => {
  env.PM2_HOME = PM2_HOME
  await execa.command(`${pm2} kill`, { cwd: networkDir, env, stdio: [0, 1, 2] })
}

const pm2Reset = async (arg, env = {}) => {
  env.PM2_HOME = PM2_HOME
  await execa.command(`${pm2} reset ${arg}`, { env, stdio: [0, 1, 2] })
}

const pm2Del = async (arg, env = {}) => {
  env.PM2_HOME = PM2_HOME
  await execa.command(`${pm2} del ${arg}`, { env, stdio: [0, 1, 2] })
}

const pm2List = async (networkDir, env = {}) => {
  env.PM2_HOME = PM2_HOME
  await execa.command(`${pm2} list`, { cwd: networkDir, env, stdio: [0, 1, 2] })
  console.log(networkDir)
}

const pm2Exec = async (arg, env = {}) => {
  env.PM2_HOME = PM2_HOME
  await execa.command(`${pm2} ${arg}`, { env, stdio: [0, 1, 2] })
}

const checkNetworkFolder = (networkPath) => {
  const networkConfigPath = path.join(networkPath, 'network-config.json')
  if (fs.existsSync(networkConfigPath)) {
    const networkConfig = JSON.parse(fs.readFileSync(networkConfigPath))
    if (networkConfig['shardus-network-version'] !== version) {
      console.log('Error: Network configuration was created with a different shardus network version.')
      return false
    }
  } else {
    console.log('Error: Cannot find a valid network-config.json file on current directory.')
    return false
  }
  return true
}

module.exports = { pm2Start, pm2Stop, pm2Kill, pm2Reset, pm2Del, pm2List, pm2Exec, checkNetworkFolder }
