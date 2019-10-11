const { scale } = require("../lib");
const inquirer = require("inquirer");

const isNumber = (input, answers) => {
  if (isNaN(input)) return "Value must be a number";
  else return true;
};

const questions = [
  {
    // Number Of nodes
    default: 10,
    type: "number",
    name: "nodesToScaleUp",
    message: "How many nodes do you want to scale up by?",
    validate: isNumber
  }
];

module.exports = function(args, options, logger) {
  if (options["default"]) {
    scale();
  } else {
    inquirer.prompt(questions).then(answers => {
      scale(answers);
    });
  }
};
