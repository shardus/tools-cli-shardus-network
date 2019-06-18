const util = require('./util')

module.exports = async (pm2Arguments, instancesPath) => {
    util.pm2Command(pm2Arguments, instancesPath)
}