const { networkReset } = require('../lib')
const util = require('../lib/util')
const path = require('path')

module.exports = (args, options, logger) => {
    let instancesPath = options['path'] ? path.resolve(options['path']) : process.cwd()
    if (util.checkNetworkFolder(instancesPath)) networkReset(args['reference'], instancesPath)
}