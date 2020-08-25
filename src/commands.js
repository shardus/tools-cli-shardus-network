const actions = require('./actions')

const register = {
  create (prog, namespace) {
    prog
      .command(
        `${namespace ? namespace + ' ' : ''}create-net`,
        'Create a new test network'
      )
      .alias('create')
      // .argument('[options]', 'Options for creating a test network')
      .argument('[num]', 'Number of nodes to create inside of [network_dir]')
      .complete(() => [1, 5, 10, 15, 20])
      .argument('[network_dir]', 'The directory to create the network folder (/instances by default)')
      .complete(() => ['networkFolder', 'instances'])
      .option('--no-start', 'Does not start the network after creating it')
      .argument('[pm2...]', 'Additional arguments/flags to pass to PM2. Prefix them with \'pm2\' e.g., \'pm2--no-autorestart\' ')
      .action(actions.create)
  },
  start (prog, namespace) {
    prog
      .command(
        `${namespace ? namespace + ' ' : ''}start-net`,
        'Start a test network'
      )
      .alias('start')
      .argument('[num]', 'Number of nodes to start in the [network_dir]')
      .argument('[network_dir]', 'The directory to start the nodes from')
      .option('--autorestart', 'Ensures that PM2 will autorestart nodes that have stopped')
      .argument('[pm2...]', 'Additional arguments/flags to pass to PM2. Prefix them with \'pm2\' e.g., \'pm2--no-autorestart\' ')
      .action(actions.start)
  },
  stop (prog, namespace) {
    prog
      .command(`${namespace ? namespace + ' ' : ''}stop-net`, 'Stop a test network')
      .alias('stop')
      .argument('[num]', 'Number of nodes to stop in the [network_dir]')
      .argument('[network_dir]', 'The directory to stop the nodes from')
      .action(actions.stop)
  },
  clean (prog, namespace) {
    prog
      .command(
        `${namespace ? namespace + ' ' : ''}clean-net`,
        'Clean the state of all instances in a test net'
      )
      .alias('clean')
      .argument('[num]', 'Number of nodes to clean in the [network_dir]')
      .argument('[network_dir]', 'The directory to clean the nodes from')
      .action(actions.clean)
  },
  config (prog, namespace) {
    prog.command(
      `${namespace ? namespace + ' ' : ''}config-net`
    )
    .alias('config')
    .argument('[network_dir]', 'The directory to set config.json for all instances')
    .action(actions.config)
  },
  list (prog, namespace) {
    prog
      .command(
        `${namespace ? namespace + ' ' : ''}list-net`
      )
      .alias('ls')
      .argument('[network_dir]', 'The directory to stop the nodes from')
      .action(actions.list)
  },
  pm2 (prog, namespace) {
    prog
      .command(
        `${namespace ? namespace + ' ' : ''}pm2`,
        'Run a pm2 command in the test net dir'
      )
      .argument('[networkDir]', 'The directory to run the pm2 command in')
      .argument('[commands...]', 'pm2 commands to run')
      .action(actions.pm2)
  }
}

module.exports = register
