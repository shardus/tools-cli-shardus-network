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

    let stoppedArchiversCount = stoppedArchivers.length

    if (existingArchivers.length > stopArchiverCount) {
      const activeArchivers = existingArchivers.slice(stopArchiverCount, existingArchivers.length)
      // Stop archivers on ports following existingArchivers (parallel)
      const archiverStops = []
      for (let i = 0; i < stopArchiverCount; i++) {
        archiverStops.push(
          util.pm2Stop(
            networkDir,
            `"archive-server-${stoppedArchiversCount + 1}"`
          )
        )
        stoppedArchivers.push(existingArchivers[i])
        stoppedArchiversCount++
      }
      await Promise.all(archiverStops)
      activeArchivers.sort((a, b) => a.port - b.port)
      networkConfig.existingArchivers = JSON.stringify(activeArchivers)
      networkConfig.stoppedArchivers = JSON.stringify(stoppedArchivers)
    }
  } else if (options.archiverPort) {
    let archiverPortToStop = parseInt(options.archiverPort)
    if (!(archiverPortToStop > 4000 && archiverPortToStop < 4010)) {
      console.log('The archiverPort is invalid')
      return
    }
    let existingArchivers = JSON.parse(networkConfig.existingArchivers)

    let archiverIsInTheList = existingArchivers.filter(archiver => archiver.port === archiverPortToStop)
    if (archiverIsInTheList.length === 0) {
      console.log(`The archiver with port ${archiverPortToStop} is not running.`)
      return
    }
    let stoppedArchivers
    if (networkConfig.stoppedArchivers)
      stoppedArchivers = JSON.parse(networkConfig.stoppedArchivers)
    else
      stoppedArchivers = []

    let archiverIndex = archiverPortToStop % 4000 + 1

    const activeArchivers = existingArchivers.filter(archiver => archiver.port !== archiverPortToStop)

    await util.pm2Stop(
      networkDir,
      `"archive-server-${archiverIndex}"`
    )
    stoppedArchivers.push(archiverIsInTheList[0])
    activeArchivers.sort((a, b) => a.port - b.port)
    networkConfig.existingArchivers = JSON.stringify(activeArchivers)
    networkConfig.stoppedArchivers = JSON.stringify(stoppedArchivers)
  } else if (num) {
    //for (let port = networkConfig.lowestPort; port <= networkConfig.highestPort; port++) {
    let stoppedConsensors
    if (networkConfig.stoppedConsensors)
      stoppedConsensors = networkConfig.stoppedConsensors
    else
      stoppedConsensors = []
    
    // Stop nodes in parallel for speed
    const nodeStops = []
    networkConfig.runningPorts.forEach(port => {
      if (num > 0) {
        nodeStops.push(util.pm2Stop(networkDir, `"shardus-instance-${port}"`))
        networkConfig.runningPorts = networkConfig.runningPorts.filter(p => p !== port)
        stoppedConsensors.push(port)
      }
      num--
    })
    await Promise.all(nodeStops)
    console.log(`✓ Stopped ${nodeStops.length} node(s)`)
    networkConfig.stoppedConsensors = stoppedConsensors
  } else {
    console.log('Stopping all processes...')
    await util.pm2Stop(networkDir, 'all')
    console.log('✓ All processes stopped')
    networkConfig.runningPorts = []
    networkConfig.startArchiver = true
    networkConfig.startMonitor = true
    networkConfig.startExplorerServer = true
  }
  shell.ShellString(JSON.stringify(networkConfig, null, 2)).to(`network-config.json`)
}
