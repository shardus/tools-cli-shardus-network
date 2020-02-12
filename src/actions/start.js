const { start } = require('../lib')
const util = require('../lib/util')

module.exports = function (args, options, logger) {
  if (util.checkNetworkFolder(process.cwd())) start(args.pm2)
}
