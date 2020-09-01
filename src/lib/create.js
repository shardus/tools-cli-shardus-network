const defaultNetworkConfig = require('../configs/default-network-config.js')
const defaultServerConfig = require('../configs/default-server-config')
const path = require('path')
const shell = require('shelljs')
const _ = require('lodash')
const { version } = require('../../package.json')

module.exports = function (networkDir, configs) {
  const networkConfig = {
    ...defaultNetworkConfig,
    ...configs
  }
  networkConfig.serverPath = path.resolve(networkConfig.serverPath)
  networkConfig['shardus-network-version'] = version
  shell.mkdir(networkDir)
  shell.cd(networkDir)
  const serverConfig = _.cloneDeep(defaultServerConfig)
  serverConfig.server.p2p.seedList = `http://${networkConfig.seedNodeServerAddr}:${networkConfig.seedNodeServerPort}/api/seednodes`
  serverConfig.server.reporting.recipient = `http://${networkConfig.monitorServerAddr}:${networkConfig.monitorServerPort}/api`
  let highestExternalPort = networkConfig.highestPort || networkConfig.startingExternalPort
  let offset = highestExternalPort > networkConfig.startingExternalPort ? 1 : 0
  for (let i = 0; i < networkConfig.numberOfNodes; i++) {
    const nodeConfig = _.cloneDeep(serverConfig)
    nodeConfig.server.ip.externalPort = highestExternalPort + i + offset
    nodeConfig.server.ip.internalPort = networkConfig.startingInternalPort + i + (highestExternalPort - networkConfig.startingExternalPort) + offset
    shell.mkdir(`shardus-instance-${nodeConfig.server.ip.externalPort}`)
    console.log(`Created server instance on folder <shardus-instance-${nodeConfig.server.ip.externalPort}>`)
    shell.ShellString(JSON.stringify(nodeConfig, null, 2)).to(`shardus-instance-${nodeConfig.server.ip.externalPort}/config.json`)
    if (nodeConfig.server.ip.externalPort > networkConfig.highestPort) {
      networkConfig.highestPort= nodeConfig.server.ip.externalPort
    }
  }
  networkConfig.lowestPort = networkConfig.startingExternalPort
  networkConfig.runningPorts = networkConfig.runningPorts ? networkConfig.runningPorts : []
  shell.ShellString(JSON.stringify(networkConfig, null, 2)).to(`network-config.json`)
}
