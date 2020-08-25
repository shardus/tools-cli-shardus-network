const util = require('./util')

module.exports = async function (networkDir, commands) {
  // Run PM2 commands
  await util.pm2Exec(networkDir, commands.join(' '))
}
