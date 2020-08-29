const shell = require('shelljs')
const fs = require('fs')

module.exports = async function (networkDir, config, networkConfig) {
  shell.cd(networkDir)
  const instances = shell.ls('-d', `${networkDir}/shardus-instance*`)
  for (let i = 0; i < instances.length; i++) {
    shell.cd(instances[i])
    let oldConfig = JSON.parse(fs.readFileSync(`${instances[i]}/config.json`, 'utf-8'))
    let newConfig = {
      server: {
        ...oldConfig.server,
        ...config.server
      }
    }
    shell.ShellString(JSON.stringify(newConfig, null, 2)).to(`config.json`)
  }
}