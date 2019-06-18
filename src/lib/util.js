const execa = require('execa')
const fs = require('fs')
const path = require('path')
const { version } = require('../../package.json')
const PM2_HOME = path.join(process.cwd(), '/.pm2/')

const getPm2Path = (instancesPath) => path.join(instancesPath, './pm2')

const pm2Start = async (script, name, env = {}, instancesPath) => {
    env['pm2_home'] = getPm2Path(instancesPath)
    await execa('npx pm2', ['start', script, `--name=${name}`], {env, stdio: [0, 1, 2]})
}

const pm2Stop = async (pm2Reference, instancesPath) => {
    let env = { PM2_HOME: getPm2Path(instancesPath) }
    await execa('pm2', ['stop', pm2Reference], {env, stdio: [0, 1, 2]})
}

const pm2Reset = async (pm2Reference, instancesPath) => {
    let env = { PM2_HOME: getPm2Path(instancesPath) }
    await execa('pm2', ['reset', pm2Reference], {env, stdio: [0, 1, 2]})
}

const pm2Del = async (pm2Reference, instancesPath) => {
    let env = { PM2_HOME: getPm2Path(instancesPath) }
    await execa('pm2', ['del', pm2Reference], {env, stdio: [0, 1, 2]})
}

const pm2List = async (instancesPath) => {
    let env = { PM2_HOME: getPm2Path(instancesPath) }
    await execa('pm2', ['list'], {env, stdio: [0, 1, 2]})
}

const pm2Command = async (pm2Arguments, instancesPath) => {
    let env = { PM2_HOME: getPm2Path(instancesPath) }
    await execa('pm2', pm2Arguments, {env, stdio: [0, 1, 2]})
}

const checkNetworkFolder = (networkPath) => {
    let networkConfigPath = path.resolve(networkPath, 'network-config.json')
    if (fs.existsSync(networkConfigPath)) {
        let networkConfig = JSON.parse(fs.readFileSync(networkConfigPath))
        if (networkConfig['shardus-network-version'] !== version) {
            console.log('Error: Network configuration was created with a different shardus network version.')
            return false
        }
    } else {
        console.log(`Error: Cannot find a valid network-config.json file on ${networkConfigPath}.`)
        return false
    }
    return true
}

module.exports = { pm2Start, pm2Stop, pm2Reset, pm2Del, pm2List, checkNetworkFolder, pm2Command}