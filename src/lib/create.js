const defaultNetworkConfig = require('./default-network-config.js')
const defaultServerConfig = require('./default-server-config')
const shell = require('shelljs')

module.exports = (configs) => {
    let networkConfig = {        
        ...defaultNetworkConfig,
        ...configs
    }
    shell.mkdir(networkConfig.instancesPath)
    console.log(networkConfig)
}