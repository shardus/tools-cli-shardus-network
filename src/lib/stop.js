const util = require('./util')
const shell = require('shelljs')
const path = require('path')
const fs = require('fs')
module.exports = async function (networkDir, num) {
  shell.cd(networkDir)
  const instancesPath = path.join(process.cwd())
  const configPath = path.join(instancesPath, 'network-config.json')
  const networkConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'))

  if (num) {
    //for (let port = networkConfig.lowestPort; port <= networkConfig.highestPort; port++) {
    networkConfig.runningPorts.forEach(port => {
      if (num > 0) {
        util.pm2Stop(networkDir, `"shardus-instance-${port}"`)
        networkConfig.runningPorts = networkConfig.runningPorts.filter(p => p !== port)
      }
      num--
    })
  } else {
    util.pm2Stop(networkDir, 'all')
    networkConfig.runningPorts = []
    networkConfig.startArchiver = true
    networkConfig.startMonitor = true
    networkConfig.startExplorerServer = true
  }
  shell.ShellString(JSON.stringify(networkConfig, null, 2)).to(`network-config.json`)
}
