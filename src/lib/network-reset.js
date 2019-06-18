const util = require('./util')

module.exports = async (reference, instancesPath) => {
    util.pm2Reset(reference, instancesPath)
}