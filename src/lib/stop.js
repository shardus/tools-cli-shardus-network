const util = require('./util')

module.exports = async function (networkDir, num) {
  if (num) {
    for (let i = 2; i < parseInt(num) + 2; i++) {
      util.pm2Stop(networkDir, `${i}`)
    }
  } else {
    util.pm2Stop(networkDir, 'all')
  }
}
