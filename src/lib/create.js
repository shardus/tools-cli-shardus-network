const defaultNetworkConfig = require('../configs/default-network-config.js')
const defaultServerConfig = require('../configs/default-server-config')
const path = require('path')
const shell = require('shelljs')
const _ = require('lodash')
const { version } = require('../../package.json')

module.exports = function (configs) {
  const networkConfig = {
    ...defaultNetworkConfig,
    ...configs
  }
  networkConfig.serverPath = path.resolve(networkConfig.serverPath)
  networkConfig['shardus-network-version'] = version
  shell.mkdir(networkConfig.instancesPath)
  shell.cd(networkConfig.instancesPath)
  const serverConfig = _.cloneDeep(defaultServerConfig)
  serverConfig.server.p2p.seedList = `http://${networkConfig.seedNodeServerAddr}:${networkConfig.seedNodeServerPort}/api/seednodes`
  serverConfig.server.reporting.recipient = `http://${networkConfig.monitorServerAddr}:${networkConfig.monitorServerPort}/api`
  for (let i = 0; i < networkConfig.numberOfNodes; i++) {
    const nodeConfig = _.cloneDeep(serverConfig)
    nodeConfig.server.ip.externalPort = networkConfig.startingExternalPort + i
    nodeConfig.server.ip.internalPort = networkConfig.startingInternalPort + i
    shell.mkdir(`shardus-instance-${nodeConfig.server.ip.externalPort}`)
    console.log(`Created server instance on folder <shardus-instance-${nodeConfig.server.ip.externalPort}>`)
    shell.ShellString(JSON.stringify(nodeConfig, null, 2)).to(`shardus-instance-${nodeConfig.server.ip.externalPort}/config.json`)
  }
  shell.ShellString(JSON.stringify(networkConfig, null, 2)).to(`network-config.json`)
  const nextPortConfig =  {
    externalPort:
      networkConfig.numberOfNodes + networkConfig.startingExternalPort,
    internalPort:
      networkConfig.numberOfNodes + networkConfig.startingInternalPort
  }
  shell.ShellString(JSON.stringify(
   nextPortConfig,
    null,
    2
  )).to(`next-port.json`)
  
}
