const shell = require('shelljs')
const fs = require('fs')
const path = require('path')
const util = require('./util')
const archiverKeys = require('../configs/archiver-config')

module.exports = async function (networkDir, num, type, pm2Args, options) {
  shell.cd(networkDir)
  const instancesPath = path.join(process.cwd())
  const configPath = path.join(instancesPath, 'network-config.json')
  const networkConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'))

  // Pass PM2 parameters to not restart a node if it exits with an error code
  if (pm2Args.includes('pm2--count-exit-errors') === false) {
    pm2Args.push('pm2--count-exit-errors')
  }
  if (pm2Args.includes('pm2--max-restarts') === false || pm2Args.includes('pm2--max-restarts=1') === false) {
    pm2Args.push('pm2--max-restarts=1')
  }

  const instances = shell.ls('-d', `${instancesPath}/shardus-instance*`)
  let nodesToStart = num ? num : instances.length

  try {
    if (options.archivers) {
      let existingArchivers = [...networkConfig.existingArchivers]
      let archiverCount = parseInt(options.archivers)
      if (archiverCount > 9) archiverCount = 9
      for (let i = 1; i <= archiverCount; i++) {
        await util.pm2Start(networkDir, require.resolve('archive-server', { paths: [process.cwd()] }), `archive-server-${i + 1}`, { ARCHIVER_PORT: networkConfig.seedNodeServerPort + i, ARCHIVER_PUBLIC_KEY: archiverKeys[i].publicKey, ARCHIVER_SECRET_KEY: archiverKeys[i].secretKey, ARCHIVER_EXISTING: JSON.stringify(existingArchivers), ARCHIVER_DB: `archiver-db-${archiverKeys[i].port}` }, pm2Args)
      }
      for (let i = 1; i <= archiverCount; i++) {
        existingArchivers.push({ ip: '127.0.0.1', port: networkConfig.seedNodeServerPort + i, publicKey: archiverKeys[i] })
      }
      networkConfig.existingArchivers = existingArchivers
      shell.ShellString(JSON.stringify(networkConfig, null, 2)).to(`network-config.json`)
      return
    }

    // Start archiver and monitor
    if (networkConfig.startSeedNodeServer) {

      await util.pm2Start(networkDir, require.resolve('archive-server', { paths: [process.cwd()] }), `archive-server-1`, { ARCHIVER_PORT: networkConfig.seedNodeServerPort, ARCHIVER_PUBLIC_KEY: archiverKeys[0].publicKey, ARCHIVER_SECRET_KEY: archiverKeys[0].secretKey, ARCHIVER_EXISTING: '[]', ARCHIVER_DB: `archiver-db-${archiverKeys[0].port}` }, pm2Args)

      let existingArchivers = [{ ip: '127.0.0.1', port: networkConfig.seedNodeServerPort, publicKey: archiverKeys[0] }]
      networkConfig.existingArchivers = existingArchivers
      networkConfig.startSeedNodeServer = false
    }
    if (networkConfig.startMonitorServer) {
      await util.pm2Start(networkDir, require.resolve('monitor-server', { paths: [process.cwd()] }), 'monitor-server', { PORT: networkConfig.monitorServerPort }, pm2Args)
      networkConfig.startMonitorServer = false
    }
    if (networkConfig.startExplorerServer) {
      await util.pm2Start(networkDir, require.resolve('explorer-server', { paths: [process.cwd()] }), 'explorer-server', { PORT: networkConfig.explorerServerPort }, pm2Args)
      networkConfig.startExplorerServer = false
    }
    // if (networkConfig.startExplorerClient) {
    //   await util.pm2Start(networkDir, require.resolve('explorer-client', { paths: [process.cwd()] }), 'explorer-client', { PORT: networkConfig.explorerClientPort }, pm2Args)
    //   networkConfig.startExplorerClient = false
    // }
  } catch (err) {
    console.log(err)
  }

  if (type === 'create') {
    for (let i = 0; i < nodesToStart; i++) {
      if (!networkConfig.runningPorts.includes(networkConfig.lowestPort + i)) {
        if (instances[i]) {
          await util.pm2Start(networkDir, networkConfig.serverPath, path.basename(instances[i]), { BASE_DIR: instances[i] }, pm2Args)
          networkConfig.runningPorts.push(networkConfig.lowestPort + i)
        }
      } else {
        nodesToStart++
      }
    }
  }

  if (type === 'start') {
    for (let i = instances.length - num; i < instances.length; i++) {
      await util.pm2Start(networkDir, networkConfig.serverPath, path.basename(instances[i]), { BASE_DIR: instances[i] }, pm2Args)
      let port = parseInt(instances[i].split('-').pop())
      networkConfig.runningPorts.push(port)
    }
  }

  shell.ShellString(JSON.stringify(networkConfig, null, 2)).to(`network-config.json`)

  console.log()
  console.log('\x1b[33m%s\x1b[0m', 'View network monitor at:') // Yellow
  console.log('  http://localhost:\x1b[32m%s\x1b[0m', networkConfig.monitorServerPort) // Green
  console.log()
}
