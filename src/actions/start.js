const path = require('path')
const { start } = require('../lib')
const util = require('../lib/util')
const create = require('../actions/create')
const fs = require('fs')

module.exports = function (args, options, logger) {
  const networkDir = options.dir ? path.join(process.cwd(), options.dir) : path.join(process.cwd(), 'instances')
  if (fs.existsSync(networkDir)) {
    if (util.checkNetworkFolder(networkDir)) start(networkDir, parseInt(args.num), 'create', args.pm2)
    else create(args, Object.assign(options, {'noStart': false}), logger)
  } else {
    throw new Error(`Unable to find network directory ${networkDir}`)
  }
}
