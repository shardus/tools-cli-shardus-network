const { pm2 } = require('../lib')
const util = require('../lib/util')

module.exports = function (args, options, logger) {
  if (util.checkNetworkFolder(process.cwd())) {
    pm2(args.commands)
  }
}
