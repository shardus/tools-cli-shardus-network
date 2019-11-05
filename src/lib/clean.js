const path = require('path')
const shell = require('shelljs')
const util = require('./util')

module.exports = async function () {
  const instancesPath = path.join(process.cwd())
  const instances = shell.ls('-d', `${instancesPath}/shardus-instance*`)
  // Delete db/, logs/, and statistics.tsv for each instance
  for (let i = 0; i < instances.length; i++) {
    shell.rm('-rf', path.join(instances[i], 'db'))
    shell.rm('-rf', path.join(instances[i], 'logs'))
    shell.rm('-rf', path.join(instances[i], 'statistics.tsv'))
    console.log(`Cleaned state: ${path.basename(instances[i])}`)
  }
  // Kill PM2 instance
  await util.pm2Kill()
  // Delete './pm2'
  shell.rm('-rf', path.join(instancesPath, '.pm2'))
  console.log(`Cleaned ./pm2`)
}