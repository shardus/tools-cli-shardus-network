const path = require('path')
const { clean } = require('../lib')
const util = require('../lib/util')

module.exports = function (args, options, logger) {
  const networkDir = options.dir ? path.join(process.cwd(), options.dir) : path.join(process.cwd(), 'instances')
  if (util.checkNetworkFolder(networkDir)) clean(networkDir, args.num)
}
