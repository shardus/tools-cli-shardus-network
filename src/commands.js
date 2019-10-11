const actions = require("./actions");

const register = {
  create(prog, namespace) {
    prog
      .command(
        `${namespace ? namespace + " " : ""}create`,
        "Create a new test network"
      )
      .option(
        "--default",
        "Use default values for the test networks network-config.json"
      )
      .action(actions.create);
  },
  start(prog, namespace) {
    prog
      .command(
        `${namespace ? namespace + " " : ""}start`,
        "Start a test network"
      )
      .action(actions.start);
  },
  scale(prog, namespace) {
    prog
      .command(
        `${namespace ? namespace + " " : ""}scale`,
        "Scale a test network"
      )
      .action(actions.scale);
  },
  stop(prog, namespace) {
    prog
      .command(`${namespace ? namespace + " " : ""}stop`, "Stop a test network")
      .action(actions.stop);
  },
  clean(prog, namespace) {
    prog
      .command(
        `${namespace ? namespace + " " : ""}clean`,
        "Clean the state of all instances in a test net"
      )
      .action(actions.clean);
  }
};

module.exports = register;
