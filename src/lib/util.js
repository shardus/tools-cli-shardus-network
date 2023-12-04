const execa = require('execa')
const fs = require('fs')
const path = require('path')
const { version } = require('../../package.json')

const pm2 = path.join(require.resolve('pm2', { paths: [path.join(__dirname, 'node_modules')] }), '../../.bin/pm2')

const pm2Start = async (networkDir, script, name, env = {}, pm2Args = []) => {
  env.PM2_HOME = path.join(networkDir, '.pm2/')
  const parsedPm2Args = pm2Args.map((arg) => arg.split('pm2')[1] || arg).join(' ')
  const execaCmd = `${pm2} start ${script} --name="${name}" ${parsedPm2Args}`
  console.log('pm2Start', execaCmd)
  await execa.command(execaCmd, { cwd: networkDir, env, stdio: [0, 1, 2] })
}

const pm2Restart = async (networkDir, name, env = {}) => {
  env.PM2_HOME = path.join(networkDir, '.pm2/')
  // const parsedPm2Args = pm2Args.map((arg) => arg.split('pm2')[1] || arg).join(' ')
  const execaCmd = `${pm2} restart ${name} --update-env`
  console.log('pm2Restart', execaCmd, env)
  await execa.command(execaCmd, { cwd: networkDir, env, stdio: [0, 1, 2] })
}

const pm2Stop = async (networkDir, arg, env = {}) => {
  env.PM2_HOME = path.join(networkDir, '.pm2/')
  await execa.command(`${pm2} stop ${arg}`, {
    cwd: networkDir,
    env,
    stdio: [0, 1, 2],
  })
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

const pm2InstallRotateLog = async (networkDir, env = {}) => {
  env.PM2_HOME = path.join(networkDir, '.pm2/')
  await execa.command(`${pm2} install pm2-logrotate`, {
    cwd: networkDir,
    env,
    stdio: [0, 1, 2],
  })
}

const pm2SetRotateLog = async (networkDir, maxSizeMb = 10, retain = 10, env = {}) => {
  env.PM2_HOME = path.join(networkDir, '.pm2/')
  await execa.command(`${pm2} set pm2-logrotate:max_size ${maxSizeMb}M`, {
    cwd: networkDir,
    env,
    stdio: [0, 1, 2],
  })
  await execa.command(`${pm2} set pm2-logrotate:retain ${retain}`, {
    cwd: networkDir,
    env,
    stdio: [0, 1, 2],
  })
  // Displays PM2s conf variables
  await execa.command(`${pm2} conf`, { cwd: networkDir, env, stdio: [0, 1, 2] })
}

const pm2Exec = async (networkDir, arg, env = {}) => {
  env.PM2_HOME = path.join(networkDir, '.pm2/')
  await execa.command(`${pm2} ${arg}`, {
    cwd: networkDir,
    env,
    stdio: [0, 1, 2],
  })
}

const checkVersion = (v1, v2) => {
  let major1 = v1.split('.')[0]
  let major2 = v2.split('.')[0]
  if (major1 !== major2) {
    return false
  }
  return true
}

const checkNetworkFolder = (networkPath, silent) => {
  // Return false if networkPath doesn't exist
  if (fs.existsSync(networkPath) === false) {
    if (!silent) console.error(`ERROR: Unable to find network directory ${networkPath}`)
    return false
  }

  const networkConfigPath = path.join(networkPath, 'network-config.json')

  // Return false if network-config.json is not found in networkPath
  if (fs.existsSync(networkConfigPath) === false) {
    if (!silent) console.error(`ERROR: Cannot find a valid network-config.json file in ${networkPath}.`)
    return false
  }

  // Attempt to parse network-config.json
  let networkConfig
  try {
    networkConfig = JSON.parse(fs.readFileSync(networkConfigPath))
  } catch (err) {
    if (!silent) console.error(`ERROR: Error parsing network-config.json: ${err.message}`)
    return false
  }

  // Return false if our shardus-network tool version is not compatible with the one that created the network
  if (checkVersion(networkConfig['shardus-network-version'], version) === false) {
    if (!silent) console.error('ERROR: Network configuration was created with a different major version of shardus network tool.')
    return false
  }

  return true
}

const setNetworkDirOrErr = (dir) => {
  // Set networkDir to CWD if dir is not passed
  let networkDir = path.join(process.cwd(), dir || '')

  // Set networkDir to networkDir/instances if networkDir fails check
  if (checkNetworkFolder(networkDir) === false) {
    networkDir = path.join(networkDir, 'instances')

    // Error if networkDir/instances fails check too
    console.log(`Checking ${networkDir}...`)
    if (checkNetworkFolder(networkDir) === false) {
      throw 'Could not find network-config.json'
    }
  }

  // Return networkDir if alls good
  return networkDir
}

const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

module.exports = {
  pm2Start,
  pm2Restart,
  pm2Stop,
  pm2Kill,
  pm2Reset,
  pm2Del,
  pm2List,
  pm2InstallRotateLog,
  pm2SetRotateLog,
  pm2Exec,
  checkNetworkFolder,
  setNetworkDirOrErr,
  sleep
}
