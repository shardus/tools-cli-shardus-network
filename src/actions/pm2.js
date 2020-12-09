const { pm2 } = require('../lib')
const util = require('../lib/util')
const path = require('path')

module.exports = function (args, options, logger) {
  const networkDir = util.setNetworkDirOrErr(options.dir)
  pm2(networkDir, args.commands)
}
