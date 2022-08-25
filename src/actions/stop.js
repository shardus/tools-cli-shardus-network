const path = require('path')
const { stop } = require('../lib')
const util = require('../lib/util')
const fs = require('fs')

module.exports = function (args, options, logger) {
  const networkDir = util.setNetworkDirOrErr(options.dir)
  stop(networkDir, args.num, options)
}
