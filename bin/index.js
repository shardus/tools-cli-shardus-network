const prog = require('caporal')
const register = require('../src/commands')

prog
  .bin('shardus-network')
  .name('Shardus Network')
  .version('1.0.0')

for (const command in register) {
  register[command](prog)
}

prog.parse(process.argv)
