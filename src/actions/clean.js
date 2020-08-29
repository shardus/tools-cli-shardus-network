const path = require('path')
const { clean } = require('../lib')
const util = require('../lib/util')

module.exports = function (args, options, logger) {
  const networkDir = args.networkDir ? path.join(process.cwd(), args.networkDir) : path.join(process.cwd(), 'instances')
  if (util.checkNetworkFolder(networkDir)) clean(networkDir, options.num)
}
