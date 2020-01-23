const shell = require('shelljs')
const fs = require('fs')
const path = require('path')
const util = require('./util')

module.exports = async function (autorestart, pm2Args) {
  const instancesPath = path.join(process.cwd())
  const configPath = path.join(instancesPath, 'network-config.json')
  const networkConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'))
  if (pm2Args.length < 1 && autorestart === false) {
    pm2Args = ['pm2--no-autorestart']
  }
  if (networkConfig.startSeedNodeServer) {
    await util.pm2Start(require.resolve('archive-server', { paths: [process.cwd()] }), 'archive-server', { ARCHIVER_PORT: networkConfig.seedNodeServerPort }, pm2Args)
  }
  if (networkConfig.startMonitorServer) {
    await util.pm2Start(require.resolve('monitor-server', { paths: [process.cwd()] }), 'monitor-server', { PORT: networkConfig.monitorServerPort }, pm2Args)
  }
  const instances = shell.ls('-d', `${instancesPath}/shardus-instance*`)
  for (let i = 0; i < instances.length; i++) {
    await util.pm2Start(networkConfig.serverPath, path.basename(instances[i]), { BASE_DIR: instances[i] }, pm2Args)
    // if (index === 0) await sleep(2000)
  }
  console.log()
  console.log('\x1b[33m%s\x1b[0m', 'View network monitor at:') // Yellow
  console.log('  http://localhost:\x1b[32m%s\x1b[0m', networkConfig.monitorServerPort) // Green
  console.log()
}
