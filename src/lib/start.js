const shell = require('shelljs')
const fs = require('fs')
const path = require('path')
const util = require('./util')

module.exports = async function (networkDir, num, pm2Args) {
  console.log(networkDir, num, pm2Args)
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
  const nodesToStart = num ? parseInt(num) : instances.length

  try {
    // Start archiver and monitor
    if (networkConfig.startSeedNodeServer) {
      await util.pm2Start(require.resolve('archive-server', { paths: [process.cwd()] }), 'archive-server', { ARCHIVER_PORT: networkConfig.seedNodeServerPort }, pm2Args)
    }
    if (networkConfig.startMonitorServer) {
      await util.pm2Start(require.resolve('monitor-server', { paths: [process.cwd()] }), 'monitor-server', { PORT: networkConfig.monitorServerPort }, pm2Args)
    }
  } catch (err) {

  }

  // Run pm2 start in each instance dir
  try {
    for (let i = 0; i < nodesToStart; i++) {
      await util.pm2Start(networkConfig.serverPath, path.basename(instances[i]), { BASE_DIR: instances[i] }, pm2Args)
      // if (index === 0) await sleep(2000)
    }
  } catch (err) {
    for (let i = 2; i < nodesToStart + 2; i++) {
      try {
        await util.pm2Start(networkConfig.serverPath, path.basename(instances[i]), { BASE_DIR: instances[i] }, pm2Args)
      } catch (err) {

      }
    }
  }
  console.log()
  console.log('\x1b[33m%s\x1b[0m', 'View network monitor at:') // Yellow
  console.log('  http://localhost:\x1b[32m%s\x1b[0m', networkConfig.monitorServerPort) // Green
  console.log()
}
