const { clean } = require('../lib')
const util = require('../lib/util')

module.exports = function (args, options, logger) {
  if (util.checkNetworkFolder(process.cwd())) clean()
}