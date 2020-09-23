const path = require('path')
const { start } = require('../lib')
const util = require('../lib/util')

module.exports = function (args, options, logger) {
  const networkDir = options.dir ? path.join(process.cwd(), options.dir) : path.join(process.cwd(), 'instances')
  if (util.checkNetworkFolder(networkDir)) start(networkDir, parseInt(args.num), 'create', args.pm2)
}
