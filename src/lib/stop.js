const util = require('./util')
const shell = require('shelljs')
const path = require('path')
const fs = require('fs')
module.exports = async function (networkDir, num, options) {
  shell.cd(networkDir)
  const instancesPath = path.join(process.cwd())
  const configPath = path.join(instancesPath, 'network-config.json')
  const networkConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'))
  if (options.archivers) {
    let existingArchivers = JSON.parse(networkConfig.existingArchivers)
    let stopArchiverCount = parseInt(options.archivers)
    if (stopArchiverCount > 9) stopArchiverCount = 9

    let stoppedArchivers
    if (networkConfig.stoppedArchivers)
      stoppedArchivers = JSON.parse(networkConfig.stoppedArchivers)
    else
      stoppedArchivers = []

    if (existingArchivers.length > stopArchiverCount) {
      const activeArchivers = existingArchivers.slice(stopArchiverCount, existingArchivers.length)
      // Stop archivers on ports following existingArchivers
      for (let i = 0; i < stopArchiverCount; i++) {
        await util.pm2Stop(
          networkDir,
          `"archive-server-${i + 1}"`
        )
        stoppedArchivers.push(existingArchivers[i])
      }
      activeArchivers.sort((a, b) => a.port - b.port)
      networkConfig.existingArchivers = JSON.stringify(activeArchivers)
      networkConfig.stoppedArchivers = JSON.stringify(stoppedArchivers)
    }
  } else if (num) {
    //for (let port = networkConfig.lowestPort; port <= networkConfig.highestPort; port++) {
    let stoppedConsensors
    if (networkConfig.stoppedConsensors)
      stoppedConsensors = networkConfig.stoppedConsensors
    else
      stoppedConsensors = []
    networkConfig.runningPorts.forEach(port => {
      if (num > 0) {
        util.pm2Stop(networkDir, `"shardus-instance-${port}"`)
        networkConfig.runningPorts = networkConfig.runningPorts.filter(p => p !== port)
        stoppedConsensors.push(port)
      }
      num--
    })
    networkConfig.stoppedConsensors = stoppedConsensors
  } else {
    util.pm2Stop(networkDir, 'all')
    networkConfig.runningPorts = []
    networkConfig.startArchiver = true
    networkConfig.startMonitor = true
    networkConfig.startExplorerServer = true
  }
  shell.ShellString(JSON.stringify(networkConfig, null, 2)).to(`network-config.json`)
}
