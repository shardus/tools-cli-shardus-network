const actions = require('./actions')

const register = {
  create (prog, namespace) {
    prog
      .command(
        `${namespace ? namespace + ' ' : ''}create-net`,
        'Create a new test network'
      )
      // .argument('[options]', 'Options for creating a test network')
      .argument('[num]', 'Number of nodes to create inside of [network_dir]')
      .argument('[network_dir]', 'The directory to create the instances folder')
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
      .argument('[num]', 'Number of nodes to start in the [network_dir]')
      .argument('[network_dir]', 'The directory to start the nodes from')
      .option('--autorestart', 'Ensures that PM2 will autorestart nodes that have stopped')
      .argument('[pm2...]', 'Additional arguments/flags to pass to PM2. Prefix them with \'pm2\' e.g., \'pm2--no-autorestart\' ')
      .action(actions.start)
  },
  scale (prog, namespace) {
    prog
      .command(
        `${namespace ? namespace + ' ' : ''}scale-net`,
        'Scale a test network'
      )
      .argument('[num]', 'Number of nodes to create and start in the [network_dir]')
      .argument('[network_dir]', 'The directory to create and start the nodes from')
      .action(actions.scale)
  },
  stop (prog, namespace) {
    prog
      .command(`${namespace ? namespace + ' ' : ''}stop-net`, 'Stop a test network')
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
      .argument('[num]', 'Number of nodes to clean in the [network_dir]')
      .argument('[network_dir]', 'The directory to clean the nodes from')
      .action(actions.clean)
  },
  list (prog, namespace) {
    prog
      .command(
        `${namespace ? namespace + ' ' : ''}list-net`
      )
      .argument('[network_dir]', 'The directory to stop the nodes from')
      .action(actions.list)
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
