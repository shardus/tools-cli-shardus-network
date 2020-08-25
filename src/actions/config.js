const path = require('path')
const { config } = require('../lib')
const util = require('../lib/util')
const inquirer = require('inquirer')
const fs = require('fs')

const questions = [
  {
    name: 'configPath',
    default: path.join(process.cwd(), './config.json'),
    message: 'Choose the config file path',
    validate: (input, answers) => {
      if (input === '') return `config file path cannot be null`
      if (!fs.existsSync(path.resolve(input))) return `Cannot find ${path.resolve(input)}`
      else return true
    }
  }
]

module.exports = function (args, options, logger) {
  const networkDir = args.networkDir ? path.join(process.cwd(), args.networkDir) : path.join(process.cwd(), 'instances')
  if (util.checkNetworkFolder(networkDir)) {
    const networkConfigPath = path.join(networkDir, 'network-config.json')
    const networkConfig = JSON.parse(fs.readFileSync(networkConfigPath, 'utf-8'))
    inquirer.prompt(questions).then(answers => {
      const configs = JSON.parse(fs.readFileSync(answers.configPath))
      config(networkDir, configs, networkConfig)
    })
  }
}
