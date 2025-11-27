const path = require('path')
const { start } = require('../lib')
const util = require('../lib/util')
const create = require('../actions/create')
const fs = require('fs')

module.exports = async function (args, options, logger) {
  try {
    const networkDir = util.setNetworkDirOrErr(options.dir)
    const configPath = path.join(networkDir, 'network-config.json')
    
    // Setup logrotate if network exists and logrotate not disabled
    if (fs.existsSync(configPath) && !options['noLogRotation']) {
      const networkConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'))
      const logSize = options.logSizeMb || networkConfig.logSize || 10
      const logNum = options.logNum || networkConfig.logNum || 10
      await util.pm2SetupLogRotation(networkDir, logSize, logNum)
    }
    
    start(networkDir, parseInt(args.num), 'create', args.pm2, options)
  } catch (err) {
    create(args, Object.assign(options, { noStart: false }), logger)
  }
}
