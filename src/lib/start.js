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
      let newArchiverCount = parseInt(options.archivers)
      if (newArchiverCount > 9) newArchiverCount = 9
      for (let i = 0; i < newArchiverCount; i++) {
        await util.pm2Start(networkDir, require.resolve('archive-server', { paths: [process.cwd()] }), `archive-server-${i + 1 + existingArchivers.length}`, { ARCHIVER_PORT: networkConfig.archivers.port + existingArchivers.length + i, ARCHIVER_PUBLIC_KEY: archiverKeys[existingArchivers.length + i].publicKey, ARCHIVER_SECRET_KEY: archiverKeys[existingArchivers.length + i].secretKey, ARCHIVER_EXISTING: JSON.stringify(existingArchivers), ARCHIVER_DB: `archiver-db-${archiverKeys[existingArchivers.length + i].port}` }, pm2Args)
      }
      for (let i = 1; i <= newArchiverCount; i++) {
        existingArchivers.push({ ip: networkConfig.archivers.ip, port: networkConfig.archivers.port + i, publicKey: archiverKeys[i] })
      }
      networkConfig.existingArchivers = existingArchivers
      shell.ShellString(JSON.stringify(networkConfig, null, 2)).to(`network-config.json`)
      return
    }

    // Start archiver and monitor
    if (networkConfig.startArchiver) {

      await util.pm2Start(networkDir, require.resolve('archive-server', { paths: [process.cwd()] }), `archive-server-1`, { ARCHIVER_PORT: networkConfig.archivers.port, ARCHIVER_PUBLIC_KEY: archiverKeys[0].publicKey, ARCHIVER_SECRET_KEY: archiverKeys[0].secretKey, ARCHIVER_EXISTING: '[]', ARCHIVER_DB: `archiver-db-${archiverKeys[0].port}` }, pm2Args)

      let existingArchivers = [{ ip: networkConfig.archivers.ip, port: networkConfig.archivers.port, publicKey: archiverKeys[0] }]
      networkConfig.existingArchivers = existingArchivers
      networkConfig.startArchiver = false
    }
    if (networkConfig.startMonitor) {
      await util.pm2Start(networkDir, require.resolve('monitor-server', { paths: [process.cwd()] }), 'monitor-server', { PORT: new URL(networkConfig.monitor).port }, pm2Args)
      networkConfig.startMonitor = false
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
  console.log('  http://localhost:\x1b[32m%s\x1b[0m', new URL(networkConfig.monitor).port) // Green
  console.log()
}
