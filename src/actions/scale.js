const path = require('path')
const { scale } = require('../lib')
const inquirer = require('inquirer')

const isNumber = (input, answers) => {
  if (isNaN(input)) return 'Value must be a number'
  else return true
}

const questions = [
  {
    // Number Of nodes
    default: 10,
    type: 'number',
    name: 'nodesToScaleUp',
    message: 'How many nodes do you want to scale up by?',
    validate: isNumber
  }
]

module.exports = function (args, options, logger) {
  const networkDir = args.networkDir ? path.join(process.cwd(), args.networkDir) : path.join(process.cwd(), 'instances')
  if (args.num) {
    scale(networkDir, parseInt(args.num))
  } else {
    inquirer.prompt(questions).then(answers => {
      scale(networkDir, parseInt(answers.nodesToScaleUp))
    })
  }
}
