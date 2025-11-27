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
  // Suppress output for cleaner logs, but still awaitable
  await execa.command(execaCmd, { cwd: networkDir, env, stdio: 'ignore' })
}

const pm2Restart = async (networkDir, name, env = {}) => {
  env.PM2_HOME = path.join(networkDir, '.pm2/')
  // const parsedPm2Args = pm2Args.map((arg) => arg.split('pm2')[1] || arg).join(' ')
  const execaCmd = `${pm2} restart ${name} --update-env`
  console.log('pm2Restart', execaCmd, env)
  // Fire and forget - don't await, suppress output for speed
  execa.command(execaCmd, { cwd: networkDir, env, stdio: 'ignore' }).catch(err => {
    console.error(`Error restarting ${name}:`, err.message)
  })
}

const pm2Stop = async (networkDir, arg, env = {}) => {
  env.PM2_HOME = path.join(networkDir, '.pm2/')
  // Don't await - fire and forget for speed, suppress output
  execa.command(`${pm2} stop ${arg}`, {
    cwd: networkDir,
    env,
    stdio: 'ignore',
  }).catch(err => {
    console.error(`Error stopping ${arg}:`, err.message)
  })
}

const pm2Kill = async (networkDir, env = {}) => {
  env.PM2_HOME = path.join(networkDir, '.pm2/')
  await execa.command(`${pm2} kill`, { cwd: networkDir, env, stdio: 'ignore' })
}

const pm2Reset = async (arg, env = {}) => {
  env.PM2_HOME = path.join(networkDir, '.pm2/')
  await execa.command(`${pm2} reset ${arg}`, { env, stdio: 'ignore' })
}

const pm2Del = async (arg, env = {}) => {
  env.PM2_HOME = path.join(networkDir, '.pm2/')
  await execa.command(`${pm2} del ${arg}`, { env, stdio: 'ignore' })
}

const pm2List = async (networkDir, env = {}) => {
  env.PM2_HOME = path.join(networkDir, '.pm2/')
  await execa.command(`${pm2} list`, { cwd: networkDir, env, stdio: 'inherit' })
}

const pm2CheckModuleInstalled = async (networkDir, moduleName, env = {}) => {
  env.PM2_HOME = path.join(networkDir, '.pm2/')
  try {
    const result = await execa.command(`${pm2} list`, { cwd: networkDir, env })
    return result.stdout.includes(moduleName)
  } catch (err) {
    return false
  }
}

const pm2GetModuleConfig = async (networkDir, env = {}) => {
  env.PM2_HOME = path.join(networkDir, '.pm2/')
  try {
    const moduleConfPath = path.join(networkDir, '.pm2', 'module_conf.json')
    if (fs.existsSync(moduleConfPath)) {
      return JSON.parse(fs.readFileSync(moduleConfPath, 'utf-8'))
    }
    return {}
  } catch (err) {
    return {}
  }
}

const pm2InstallRotateLog = async (networkDir, env = {}) => {
  env.PM2_HOME = path.join(networkDir, '.pm2/')
  
  // Check if pm2-logrotate is already installed
  const isInstalled = await pm2CheckModuleInstalled(networkDir, 'pm2-logrotate', env)
  
  if (isInstalled) {
    console.log('pm2-logrotate already installed')
    return
  }
  
  console.log('Installing pm2-logrotate...')
  
  // Install with output suppressed to avoid verbose restarts logs
  await execa.command(`${pm2} install pm2-logrotate`, {
    cwd: networkDir,
    env,
    stdio: 'ignore',
  })
  
  console.log('✓ pm2-logrotate installed')
}

const pm2SetRotateLog = async (networkDir, maxSizeMb = 10, retain = 10, env = {}) => {
  env.PM2_HOME = path.join(networkDir, '.pm2/')
  
  // Check current configuration to avoid unnecessary restarts
  const currentConfig = await pm2GetModuleConfig(networkDir, env)
  const needsUpdate = 
    !currentConfig['pm2-logrotate'] ||
    currentConfig['pm2-logrotate']['max_size'] !== `${maxSizeMb}M` ||
    currentConfig['pm2-logrotate']['retain'] !== retain
  
  if (!needsUpdate) {
    console.log(`pm2-logrotate already configured (max_size: ${maxSizeMb}M, retain: ${retain})`)
    return
  }
  
  console.log(`Configuring pm2-logrotate (max_size: ${maxSizeMb}M, retain: ${retain})...`)
  
  // Only set if configuration is different - suppress output to avoid noise
  if (!currentConfig['pm2-logrotate'] || currentConfig['pm2-logrotate']['max_size'] !== `${maxSizeMb}M`) {
    await execa.command(`${pm2} set pm2-logrotate:max_size ${maxSizeMb}M`, {
      cwd: networkDir,
      env,
      stdio: 'ignore',
    })
  }
  
  if (!currentConfig['pm2-logrotate'] || currentConfig['pm2-logrotate']['retain'] !== retain) {
    await execa.command(`${pm2} set pm2-logrotate:retain ${retain}`, {
      cwd: networkDir,
      env,
      stdio: 'ignore',
    })
  }
  
  console.log('✓ pm2-logrotate configured')
}

const pm2SetupLogRotation = async (networkDir, maxSizeMb = 10, retain = 10, env = {}) => {
  env.PM2_HOME = path.join(networkDir, '.pm2/')
  
  // Check if pm2-logrotate is already installed and configured
  const isInstalled = await pm2CheckModuleInstalled(networkDir, 'pm2-logrotate', env)
  const currentConfig = await pm2GetModuleConfig(networkDir, env)
  
  const needsConfigUpdate = 
    !currentConfig['pm2-logrotate'] ||
    currentConfig['pm2-logrotate']['max_size'] !== `${maxSizeMb}M` ||
    currentConfig['pm2-logrotate']['retain'] !== retain
  
  // If already installed and configured correctly, skip everything
  if (isInstalled && !needsConfigUpdate) {
    console.log(`✓ pm2-logrotate already configured (max_size: ${maxSizeMb}M, retain: ${retain})`)
    return
  }
  
  // Install if not installed (with suppressed output)
  if (!isInstalled) {
    console.log('Setting up pm2-logrotate...')
    await execa.command(`${pm2} install pm2-logrotate`, {
      cwd: networkDir,
      env,
      stdio: 'ignore',
    })
  }
  
  // Configure if needed (suppress output to avoid restart noise)
  if (needsConfigUpdate) {
    if (!currentConfig['pm2-logrotate'] || currentConfig['pm2-logrotate']['max_size'] !== `${maxSizeMb}M`) {
      await execa.command(`${pm2} set pm2-logrotate:max_size ${maxSizeMb}M`, {
        cwd: networkDir,
        env,
        stdio: 'ignore',
      })
    }
    
    if (!currentConfig['pm2-logrotate'] || currentConfig['pm2-logrotate']['retain'] !== retain) {
      await execa.command(`${pm2} set pm2-logrotate:retain ${retain}`, {
        cwd: networkDir,
        env,
        stdio: 'ignore',
      })
    }
  }
  
  console.log(`✓ pm2-logrotate configured (max_size: ${maxSizeMb}M, retain: ${retain})`)
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
  pm2SetupLogRotation,
  pm2Exec,
  checkNetworkFolder,
  setNetworkDirOrErr,
  sleep
}