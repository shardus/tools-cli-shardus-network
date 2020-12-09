const path = require('path')
const { clean } = require('../lib')
const util = require('../lib/util')
const fs = require('fs')

module.exports = function (args, options, logger) {
  const networkDir = util.setNetworkDirOrErr(options.dir)
  clean(networkDir, args.num)
}
