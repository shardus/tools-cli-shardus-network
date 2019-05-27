const execa = require('execa')
const fs = require('fs')
const path = require('path')
const { version } = require('../../package.json')
const PM2_HOME = path.join(process.cwd(), '.pm2/')

const pm2Start = async (script, name, env = {}) => {
    env.PM2_HOME = PM2_HOME
    await execa('pm2', ['start', script, `--name=${name}`], {env, stdio: [0, 1, 2]})
}

const pm2Stop = async (arg, env = {}) => {
    env.PM2_HOME = PM2_HOME
    await execa('pm2', ['stop', arg], {env, stdio: [0, 1, 2]})
}

const pm2Reset = async (arg, env = {}) => {
    env.PM2_HOME = PM2_HOME
    await execa('pm2', ['reset', arg], {env, stdio: [0, 1, 2]})
}

const pm2Del = async (arg, env = {}) => {
    env.PM2_HOME = PM2_HOME
    await execa('pm2', ['del', arg], {env, stdio: [0, 1, 2]})
}

const pm2List = async (env = {}) => {
    env.PM2_HOME = PM2_HOME
    await execa('pm2', ['list'], {env, stdio: [0, 1, 2]})
}

const checkNetworkFolder = (networkPath) => {
    let networkConfigPath = path.join(networkPath, 'network-config.json')
    if (fs.existsSync(networkConfigPath)) {
        let networkConfig = JSON.parse(fs.readFileSync(networkConfigPath))
        if (networkConfig['shardus-network-version'] !== version) {
            console.log('Error: Network configuration was created with a different shardus network version.')
            return false
        }
    } else {
        console.log('Error: Cannot find a valid network-config.json file on current directory.')
        return false
    }
    return true
}

module.exports = { pm2Start, pm2Stop, pm2Reset, pm2Del, pm2List, checkNetworkFolder}