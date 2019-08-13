const shell = require('shelljs')
const fs = require('fs')
const path = require('path')
const util = require('./util')

module.exports = async function () {
  const instancesPath = path.join(process.cwd())
  const configPath = path.join(instancesPath, 'network-config.json')
  const networkConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'))
  if (networkConfig.startSeedNodeServer) {
    await util.pm2Start(require.resolve('seed-node-server'), 'Seed-node-server', { PORT: networkConfig.seedNodeServerPort, TIME_INTERVAL: 5 })
  }
  if (networkConfig.startMonitorServer) {
    await util.pm2Start(require.resolve('monitor-server'), 'Monitor-server', { PORT: networkConfig.monitorServerPort })
  }
  const instances = shell.ls('-d', `${instancesPath}/shardus-instance*`)
  for (let i = 0; i < instances.length; i++) {
    await util.pm2Start(networkConfig.serverPath, path.basename(instances[i]), { BASE_DIR: instances[i] })
    // if (index === 0) await sleep(2000)
  }
  console.log()
  console.log('\x1b[33m%s\x1b[0m', 'View network monitor at:') // Yellow
  console.log('  http://localhost:\x1b[32m%s\x1b[0m', networkConfig.monitorServerPort) // Green
  console.log()
}
