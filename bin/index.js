#!/usr/bin/env node

const prog = require('caporal')
const register = require('../src/commands')
const package = require('../package.json')

prog
  .bin('shardus-network')
  .name('Shardus Network')
  .version(package.version)

for (const command in register) {
  register[command](prog)
}

prog.parse(process.argv)
