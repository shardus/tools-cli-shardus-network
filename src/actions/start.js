const path = require('path')
const { start } = require('../lib')
const util = require('../lib/util')

module.exports = function (args, options, logger) {
  const networkDir = args.networkDir ? path.join(process.cwd(), args.networkDir) : path.join(process.cwd(), 'instances')
  if (util.checkNetworkFolder(networkDir)) start(networkDir, options.num, args.pm2)
}
