const { networkDel } = require('../lib')
const util = require('../lib/util')

module.exports = (args, options, logger) => {
    if (util.checkNetworkFolder(process.cwd())) networkDel(args['reference'])
}