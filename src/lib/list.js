const util = require('./util')

module.exports = async function (networkDir) {
    await util.pm2List(networkDir)
}