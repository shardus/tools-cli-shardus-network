#!/usr/bin/env node
const prog = require('caporal')
// const actions= require('../src/actions')
const Actions = require('../src/cli-actions')

prog
    .bin('shardus-network')
    .name('Shardus Network Tool')
    .version('1.0.0')
    // init command, to create a new sample project
    .command('create', 'Creates a sample shardus network project')
  //  .argument('<appName>', 'Project name')
    .option('--default', 'Creates a sample shardus network project with default configuration values')
    .action(Actions.create)

    // Start network
    .command('start', 'Start a shardus network on current path')
    .option('-p, --path <networkFolder>', 'Path for a folder containing the instances of a shardus network, defaults to pwd',  prog.STRING)
    .action(Actions.start)

    // List process pm2 proxy
    .command('list', 'List all pm2 managed process')
    .option('-p, --path <networkFolder>', 'Path for a folder containing the instances of a shardus network, defaults to pwd',  prog.STRING)
    .action(Actions.list)
    
    // Stop node pm2 proxy
    .command('stop', 'Stops given pm2 managed process by its name, pm2_id or <all>')
    .option('-p, --path <networkFolder>', 'Path for a folder containing the instances of a shardus network, defaults to pwd',  prog.STRING)
    .argument('<reference>', 'Process id, name or all')
    .action(Actions.stop)

    // Delete process pm2 proxy
    .command('del', 'Stops and unregister given pm2 managed process by its name, pm2_id or <all>')
    .option('-p, --path <networkFolder>', 'Path for a folder containing the instances of a shardus network, defaults to pwd',  prog.STRING)
    .argument('<reference>', 'Process id, name or all')
    .action(Actions.del)

    // Reset process pm2 proxy
    .command('reset', 'Resets given pm2 managed process by its name, pm2_id or <all>')
    .option('-p, --path <networkFolder>', 'Path for a folder containing the instances of a shardus network, defaults to pwd',  prog.STRING)
    .argument('<reference>', 'Process id, name or all')
    .action(Actions.reset)

    // Run a pm2 command
    .command('pm2', 'Runs a pm2 command')
    .option('-p, --path <networkFolder>', 'Path for a folder containing the instances of a shardus network, defaults to pwd',  prog.STRING)
    .argument('[pm2Args...]', 'PM2 command arguments')
    .action(Actions.pm2)    

prog.parse(process.argv);