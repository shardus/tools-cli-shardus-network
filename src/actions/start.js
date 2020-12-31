const path = require('path')
const { start } = require('../lib')
const util = require('../lib/util')
const create = require('../actions/create')
const fs = require('fs')

module.exports = function (args, options, logger) {
  try {
    const networkDir = util.setNetworkDirOrErr(options.dir)
    start(networkDir, parseInt(args.num), 'create', args.pm2, options)
  } catch (err) {
    create(args, Object.assign(options, { noStart: false }), logger)
  }
}
