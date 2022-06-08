const path = require('path')
const { restart } = require('../lib')
const util = require('../lib/util')
const fs = require('fs')

module.exports = function (args, options) {
    const networkDir = util.setNetworkDirOrErr(options.dir)
    restart(networkDir, options, args)
}
