const defaultNetworkConfig = require('./default-network-config.js')
const defaultServerConfig = require('./default-server-config')
const path = require('path')
const shell = require('shelljs')
const _ = require('lodash')

module.exports = (configs) => {
    let networkConfig = {        
        ...defaultNetworkConfig,
        ...configs
    }
    networkConfig.serverPath = path.resolve(networkConfig.serverPath)
    shell.mkdir(networkConfig.instancesPath)
    shell.cd(networkConfig.instancesPath)
    let serverConfig = _.cloneDeep(defaultServerConfig)
    serverConfig.server.p2p.seedList = `http://${networkConfig.seedNodeServerAddr}:${networkConfig.seedNodeServerPort}/api/seednodes`,
    serverConfig.server.reporting.recipient = `http://${networkConfig.monitorServerAddr}:${networkConfig.monitorServerPort}/api`    
    for (let i = 0; i < networkConfig.numberOfNodes; i++) {
        let nodeConfig = _.cloneDeep(serverConfig)
        nodeConfig.server.ip.externalPort = networkConfig.startingExternalPort + i
        nodeConfig.server.ip.internalPort = networkConfig.startingInternalPort + i
        shell.mkdir(`shardus-instance-${nodeConfig.server.ip.externalPort}`)
        console.log(`Created server instance on folder <shardus-instance-${nodeConfig.server.ip.externalPort}>`)
        shell.ShellString(JSON.stringify(nodeConfig)).to(`shardus-instance-${nodeConfig.server.ip.externalPort}/config.json`)
    }
    shell.ShellString(JSON.stringify(networkConfig)).to(`network-config.json`)
}