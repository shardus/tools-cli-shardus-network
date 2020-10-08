const { create } = require('../lib')
const inquirer = require('inquirer')
const fs = require('fs')
const defaultNetwork = require('../configs/default-network-config')
const path = require('path')
const { start } = require('../lib')
const util = require('../lib/util')

// Try to get serverPath from `main` field of package.json, otherwise use default
let serverPath
try {
  const packageJson = JSON.parse(fs.readFileSync(path.join(process.cwd(), './package.json')))
  serverPath = packageJson.main
} catch (err) {
  serverPath = defaultNetwork.serverPath
}

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
    default: serverPath,
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
  { // Starting external port
    default: defaultNetwork.startingExternalPort,
    type: 'number',
    name: 'startingExternalPort',
    message: 'Whats the starting external port ? (the nodes will be created from starting external port to starting external port + number of nodes',
    validate: isNumber
  },
  { // Starting internal port
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
  { // Whether starts or not the seed node server locally
    default: defaultNetwork.startSeedNodeServer,
    name: 'startSeedNodeServer',
    type: 'confirm',
    message: 'Do you want to run a archive-server instance locally ?',
    validate: notNull
  },
  { // If yes, just ask in which port it'll run
    default: defaultNetwork.seedNodeServerPort,
    name: 'seedNodeServerPort',
    message: 'Which port do you want to run the archive-server ?',
    validate: isNumber,
    when: (answers) => answers.startSeedNodeServer
  },
  { // If not running seed node server locally, asks for its address and port
    default: defaultNetwork.seedNodeServerAddr,
    name: 'seedNodeServerAddr',
    message: 'What\'s the archive-server address ?',
    validate: notNull,
    when: (answers) => !answers.startSeedNodeServer
  },
  {
    default: defaultNetwork.seedNodeServerPort,
    name: 'seedNodeServerPort',
    message: 'What\'s the archive-server port ?',
    validate: isNumber,
    when: (answers) => !answers.startSeedNodeServer
  },
  { // Whether starts or not the monitor server locally
    default: defaultNetwork.startMonitorServer,
    name: 'startMonitorServer',
    type: 'confirm',
    message: 'Do you want to run a monitor server instance locally ?',
    validate: notNull
  },
  { // If yes, just ask in which port it'll run
    default: defaultNetwork.monitorServerPort,
    name: 'monitorServerPort',
    message: 'Which port do you want to run the monitor-server ?',
    validate: isNumber,
    when: (answers) => answers.startMonitorServer
  },
  {
    default: defaultNetwork.monitorServerAddr,
    name: 'monitorServerAddr',
    message: 'What\'s the monitor-server address?',
    validate: notNull,
    when: (answers) => !answers.startMonitorServer
  },
  {
    default: defaultNetwork.monitorServerPort,
    name: 'monitorServerPort',
    message: 'What\'s the monitor-server port ?',
    validate: isNumber,
    when: (answers) => !answers.startMonitorServer
  },
  { // Whether starts or not the explorer server locally
    default: defaultNetwork.startExplorerServer,
    name: 'startExplorerServer',
    type: 'confirm',
    message: 'Do you want to run an explorer-server instance locally ?',
    validate: notNull
  },
  { // If yes, just ask in which port it'll run
    default: defaultNetwork.explorerServerPort,
    name: 'explorerServerPort',
    message: 'Which port do you want to run the explorer-server ?',
    validate: isNumber,
    when: (answers) => answers.startExplorerServer
  },
  {
    default: defaultNetwork.explorerServerAddr,
    name: 'explorerServerAddr',
    message: 'What\'s the explorer-server address ?',
    validate: notNull,
    when: (answers) => !answers.startExplorerServer
  },
  {
    default: defaultNetwork.explorerServerPort,
    name: 'explorerServerPort',
    message: 'What\'s the explorer-server port ?',
    validate: isNumber,
    when: (answers) => !answers.startExplorerServer
  },
  // { // Whether starts or not the explorer client locally
  //   default: defaultNetwork.startExplorerClient,
  //   name: 'startExplorerClient',
  //   type: 'confirm',
  //   message: 'Do you want to run a explorer client instance locally ?',
  //   validate: notNull
  // },
  // {
  //   default: defaultNetwork.explorerClientAddr,
  //   name: 'explorerClientAddr',
  //   message: 'What\'s the explorer-client address ?',
  //   validate: notNull,
  //   when: (answers) => !answers.startExplorerClient
  // },
  // {
  //   default: defaultNetwork.explorerClientPort,
  //   name: 'explorerClientPort',
  //   message: 'What\'s the explorer-client port ?',
  //   validate: isNumber,
  //   when: (answers) => !answers.startExplorerClient
  // }
]

module.exports = function (args, options, logger) {

  // DBG
  console.log(options)
  console.log(args)

  const networkDir = options.dir ? path.join(process.cwd(), options.dir) : path.join(process.cwd(), 'instances')

  const num = parseInt(args.num)

  if (util.checkNetworkFolder(networkDir, true)) {
    const configPath = path.join(networkDir, 'network-config.json')
    const networkConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'))
    networkConfig.numberOfNodes = num ? num : 10
    create(networkDir, networkConfig, num, args.pm2)
    if (options['noStart'] === false) {
      start(networkDir, num, 'start', args.pm2)
    }
  } else if (args.num) {
    create(networkDir, {
      serverPath: serverPath,
      instancesPath: networkDir,
      numberOfNodes: num,
      startingExternalPort: defaultNetwork.startingExternalPort,
      startingInternalPort: defaultNetwork.startingInternalPort,
      startSeedNodeServer: defaultNetwork.startSeedNodeServer,
      seedNodeServerPort: defaultNetwork.seedNodeServerPort,
      startMonitorServer: defaultNetwork.startMonitorServer,
      monitorServerPort: defaultNetwork.monitorServerPort,
      startExplorerServer: defaultNetwork.startExplorerServer,
      explorerServerPort: defaultNetwork.explorerServerPort
    })
    if (options['noStart'] === false) {
      start(networkDir, num, 'create', args.pm2)
    }
  } else {
    inquirer.prompt(questions).then(answers => {
      create(networkDir, answers)
      if (options['noStart'] === false) {
        start(networkDir, num, 'create', args.pm2)
      }
    })
  }
}
