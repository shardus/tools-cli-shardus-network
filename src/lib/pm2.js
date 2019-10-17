const util = require('./util')

module.exports = async function (commands) {
  // Run PM2 commands
  await util.pm2Exec(commands.join(' '))
}
