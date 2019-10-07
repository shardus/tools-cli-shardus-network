const { create } = require('../lib')
const inquirer = require('inquirer')
const fs = require('fs')
const defaultNetwork = require('../configs/default-network-config')
const path = require('path')

const notNull = (input, answers) => {
  if (input === '') return 'Value cannot be empty'
  else return true
}

const isNumber = (input, answers) => {
  if (isNaN(input)) return 'Value must be a number'
  else return true
}

const questions = [
  {
    name: 'serverPath',
    default: defaultNetwork.serverPath,
    message: 'Choose the main server file path',
    validate: (input, answers) => {
      if (input === '') return `Server file path cannot be null`
      if (!fs.existsSync(path.resolve(input))) return `Cannot find ${path.resolve(input)}`
      else return true
    }
  },
  {
    default: defaultNetwork.instancesPath,
    name: 'instancesPath',
    message: 'What name should be the folder to be created for the network instances ?',
    // transformer: input =>  path.resolve(input),
    validate: (input, answers) => {
      if (input === '') return `Cannot create a directory without a name`
      if (fs.existsSync(path.resolve(input))) return `Cannot create directory ${input}, already exists`
      else return true
    }
  },
  { // Number Of nodes
    default: defaultNetwork.numberOfNodes,
    type: 'number',
    name: 'numberOfNodes',
    message: 'How many nodes do you want to create ?',
    validate: isNumber
  },
  { // Starting externap portl
    default: defaultNetwork.startingExternalPort,
    type: 'number',
    name: 'startingExternalPort',
    message: 'Whats the starting external port ? (the nodes will be created from starting external port to starting external port + number of nodes',
    validate: isNumber
  },
  { // Starting internap port
    default: defaultNetwork.startingInternalPort,
    type: 'number',
    name: 'startingInternalPort',
    message: 'Whats the starting internal port ? (the nodes will be created from starting internal port to starting internal port + number of nodes',
    validate: (input, answers) => {
      if (isNaN(input)) return 'Value must be a number'
      const extPort = answers['startingExternalPort']
      const num = answers['numberOfNodes']
      if ((input <= extPort & input + num > extPort) || (input >= extPort & extPort + num > input)) {
        return `External port value will overlap internal port, please select a value <= ${extPort - num} or >= ${extPort + num}`
      } else return true
    }
  },
  { // Wheter starts or not the seed node server locally
    default: defaultNetwork.startSeedNodeServer,
    name: 'startSeedNodeServer',
    type: 'confirm',
    message: 'Do you want to run a seed-node-server instance locally ?',
    validate: notNull
  },
  { // If yes, just ask in wich port it'll run
    default: defaultNetwork.seedNodeServerPort,
    name: 'seedNodeServerPort',
    message: 'Wich port do you want to run the seed-node-server ?',
    validate: isNumber,
    when: (answers) => answers.startSeedNodeServer
  },
  { // If not running seed node server locally, asks for ints address and port
    default: defaultNetwork.seedNodeServerAddr,
    name: 'seedNodeServerAddr',
    message: 'What\'s the seed-node-server address ?',
    validate: notNull,
    when: (answers) => !answers.startSeedNodeServer
  },
  {
    default: defaultNetwork.seedNodeServerPort,
    name: 'seedNodeServerPort',
    message: 'What\'s the seed-node-server port ?',
    validate: isNumber,
    when: (answers) => !answers.startSeedNodeServer
  },
  { // Wheter starts or not the monitor server locally
    default: defaultNetwork.startMonitorServer,
    name: 'startMonitorServer',
    type: 'confirm',
    message: 'Do you want to run a monitor server instance locally ?',
    validate: notNull
  },
  { // If yes, just ask in wich port it'll run
    default: defaultNetwork.monitorServerPort,
    name: 'monitorServerPort',
    message: 'Wich port do you want to run the monitor server ?',
    validate: isNumber,
    when: (answers) => answers.startMonitorServer
  },
  { // If not running seed node server locally, asks for ints address and port
    default: defaultNetwork.monitorServerAddr,
    name: 'monitorServerAddr',
    message: 'What\'s the seed-node-server address ?',
    validate: notNull,
    when: (answers) => !answers.startMonitorServer
  },
  {
    default: defaultNetwork.monitorServerPort,
    name: 'monitorServerPort',
    message: 'What\'s the seed-node-server port ?',
    validate: isNumber,
    when: (answers) => !answers.startMonitorServer
  }
]

module.exports = function (args, options, logger) {
  if (options['default']) {
    create()
  } else {
    inquirer.prompt(questions).then(answers => {
      create(answers)
    })
  }
}
