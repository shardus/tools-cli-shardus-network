const path = require('path')
const { stop } = require('../lib')
const util = require('../lib/util')

module.exports = function (args, options, logger) {
  const networkDir = args.networkDir ? path.join(process.cwd(), args.networkDir) : path.join(process.cwd(), 'instances')
  if (util.checkNetworkFolder(networkDir)) stop(networkDir, options.num)
}
