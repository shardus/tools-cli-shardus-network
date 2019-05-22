#!/usr/bin/env node
const prog = require('caporal')
// const actions= require('../src/actions')
const create = require('../src/actions/create')

prog
    .bin('shardus')
    .name('Shardus Tool')
    .version('1.0.0')
    // init command, to create a new sample project
    .command('create', 'Creates a sample shardus network project')
  //  .argument('<appName>', 'Project name')
    .option('--default', 'Creates a sample shardus network project with default configuration values')
    .action(create)
    
prog.parse(process.argv);