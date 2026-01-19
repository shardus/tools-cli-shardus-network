const { pm2 } = require('../lib')
const util = require('../lib/util')
const path = require('path')

module.exports = function (args, options, logger) {
  const networkDir = util.setNetworkDirOrErr(options.dir)
  const commands = args.commands || []
  // Force update of environment variables
  commands.push('--update-env')
  pm2(networkDir, commands)
}
