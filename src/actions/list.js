const path = require('path')
const { list } = require('../lib')
const util = require('../lib/util')
const fs = require('fs')

module.exports = function (args, options, logger) {
  const networkDir = options.dir ? path.join(process.cwd(), options.dir) : process.cwd()
  if (fs.existsSync(networkDir)) {
    if (util.checkNetworkFolder(networkDir)) {
      list(networkDir)
    }
  } else {
    throw new Error(`Unable to find network directory ${networkDir}`)
  }
}