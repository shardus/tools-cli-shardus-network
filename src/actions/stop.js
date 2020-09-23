const path = require('path')
const { stop } = require('../lib')
const util = require('../lib/util')

module.exports = function (args, options, logger) {
  const networkDir = options.dir ? path.join(process.cwd(), options.dir) : path.join(process.cwd(), 'instances')
  if (util.checkNetworkFolder(networkDir)) stop(networkDir, args.num)
}
