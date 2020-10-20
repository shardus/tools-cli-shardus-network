const path = require('path')
const shell = require('shelljs')
const util = require('./util')

module.exports = async function (networkDir, num) {
  shell.cd(networkDir)
  const instancesPath = path.join(process.cwd())
  const instances = shell.ls('-d', `${instancesPath}/shardus-instance*`)
  const nodesToClean = num ? parseInt(num) : instances.length
  // Delete db/, logs/, and statistics.tsv for each instance
  for (let i = 0; i < nodesToClean; i++) {
    shell.rm('-rf', path.join(instances[i], 'db'))
    shell.rm('-rf', path.join(instances[i], 'logs'))
    shell.rm('-rf', path.join(instances[i], 'statistics.tsv'))
    console.log(`Cleaned state: ${path.basename(instances[i])}`)
  }
  // Kill PM2 instance
  await util.pm2Kill(networkDir)
  // Delete './pm2'
  shell.rm('-rf', path.join(instancesPath, '.pm2'))
  console.log(`Cleaned ./pm2`)
  // Delete './archiver-db.sqlite'
  shell.rm('-rf', path.join(instancesPath, 'archiver-db.sqlite'))
  console.log(`Cleaned ./archiver-db.sqlite`)
  // Delete './explorer-db.sqlite'
  shell.rm('-rf', path.join(instancesPath, 'explorer-db.sqlite'))
  console.log(`Cleaned ./explorer-db.sqlite`)
}
