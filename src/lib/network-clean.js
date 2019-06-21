const fs = require('fs')
const path = require('path')
const shell = require('shelljs')
const util = require('./util')

module.exports = async () => {
    instancesPath = path.join(process.cwd())
    let instances = shell.ls('-d', `${instancesPath}/shardus-instance*`)
    let configPath = path.join(instancesPath, 'network-config.json')
    if (fs.existsSync(configPath)) {
        // Delete '/db' and '/logs' dir for each instance
        for (let i = 0; i < instances.length; i++) {
            shell.rm('-rf', path.join(instances[i], 'db'))
            shell.rm('-rf', path.join(instances[i], 'logs'))
            console.log(`Cleaned state: ${path.basename(instances[i])}`)
        }
        // Delete './pm2'
        shell.rm('-rf', path.join(instancesPath, '.pm2'))
        console.log(`Cleaned ./pm2`)
    } else console.log(`Error: Cannot find network-config file on current directory, please make sure to run the commands inside a network folder`)
}