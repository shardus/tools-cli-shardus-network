const path = require('path')
const { clean } = require('../lib')
const util = require('../lib/util')
const fs = require('fs')

module.exports = function (args, options, logger) {
  const networkDir = options.dir ? path.join(process.cwd(), options.dir) : path.join(process.cwd(), 'instances')
  if (fs.existsSync(networkDir)) {
    if (util.checkNetworkFolder(networkDir)) clean(networkDir, args.num)
  } else {
    throw new Error(`Unable to find network directory ${networkDir}`)
  }
}
