const shell = require('shelljs')
const fs = require('fs')
const path = require('path')
const util = require('./util')

module.exports = async (instancesPath) => {
    let configPath = path.join(instancesPath, 'network-config.json')
    if (fs.existsSync(configPath)) {
        let networkConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'))
        if (networkConfig.startSeedNodeServer) {
            await util.pm2Start(require.resolve('seed-node-server'), 'Seed-node-server', { 'PORT': networkConfig.seedNodeServerPort, 'TIME_INTERVAL': 5 }, instancesPath)
        }
        if (networkConfig.startMonitorServer) {
            await util.pm2Start(require.resolve('monitor-server'), 'Monitor-server', { 'PORT': networkConfig.monitorServerPort }, instancesPath)
        }
        let instances = shell.ls('-d', `${instancesPath}/shardus-instance*`)
        for (let i = 0; i < instances.length; i++) {
            await util.pm2Start(networkConfig.serverPath, path.basename(instances[i]), { 'BASE_DIR': instances[i] }, instancesPath)
            //if (index === 0) await sleep(2000)
        }
    } else console.log(`Error: Cannot find network-config file on current directory, please make sure to run the commands inside a network folder`)
}
