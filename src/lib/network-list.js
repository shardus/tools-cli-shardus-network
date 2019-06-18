const util = require('./util')

module.exports = async (instancesPath) => {
    util.pm2List(instancesPath)
}