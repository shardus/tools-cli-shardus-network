const util = require('./util')

module.exports = async function () {
  util.pm2Stop('all')
}
