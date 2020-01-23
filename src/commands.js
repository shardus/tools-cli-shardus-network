const actions = require('./actions')

const register = {
  create (prog, namespace) {
    prog
      .command(
        `${namespace ? namespace + ' ' : ''}create`,
        'Create a new test network'
      )
      .option(
        '--default',
        'Use default values for the test networks network-config.json'
      )
      .action(actions.create)
  },
  start (prog, namespace) {
    prog
      .command(
        `${namespace ? namespace + ' ' : ''}start`,
        'Start a test network'
      )
      .option('--autorestart', 'Autorestarts nodes that have stopped. Ignored if pm2 args are provided')
      .argument('[pm2...]', 'Additional arguments/flags to pass to PM2. Prefix them with \'pm2\' e.g., \'pm2--no-autorestart\' ')
      .action(actions.start)
  },
  scale (prog, namespace) {
    prog
      .command(
        `${namespace ? namespace + ' ' : ''}scale`,
        'Scale a test network'
      )
      .action(actions.scale)
  },
  stop (prog, namespace) {
    prog
      .command(`${namespace ? namespace + ' ' : ''}stop`, 'Stop a test network')
      .action(actions.stop)
  },
  clean (prog, namespace) {
    prog
      .command(
        `${namespace ? namespace + ' ' : ''}clean`,
        'Clean the state of all instances in a test net'
      )
      .action(actions.clean)
  },
  pm2 (prog, namespace) {
    prog
      .command(
        `${namespace ? namespace + ' ' : ''}pm2`,
        'Run a pm2 command in the test net dir'
      )
      .argument('[commands...]', 'pm2 commands to run')
      .action(actions.pm2)
  }
}

module.exports = register
