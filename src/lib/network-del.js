const util = require('./util')

module.exports = async (reference, instancesPath) => {
    util.pm2Del(reference, instancesPath)
}