const { pm2 } = require('../lib')
const util = require('../lib/util')
const path = require('path')

module.exports = function (args, options, logger) {
  const networkDir = args.networkDir ? path.join(process.cwd(), args.networkDir) : path.join(process.cwd(), 'instances')
  if (util.checkNetworkFolder(networkDir)) {
    pm2(networkDir, args.commands)
  }
}
