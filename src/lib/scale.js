const defaultNetworkConfig = require("../configs/default-network-config.js");
const defaultServerConfig = require("../configs/default-server-config");
const shell = require("shelljs");
const fs = require("fs");
const path = require("path");
const util = require("./util");
const { readdirSync } = require("fs");
const _ = require("lodash");

module.exports = async function(configs) {
  const networkConfig = {
    ...defaultNetworkConfig,
    ...configs
  };
  const instancesPath = path.join(process.cwd());
  const configPath = path.join(instancesPath, "network-config.json");
  const startConfig = JSON.parse(fs.readFileSync(configPath, "utf-8"));

  let existingInstances = 0;

  readdirSync(instancesPath).forEach(fileName => {
    if (fileName.includes("shardus-instance")) {
      existingInstances++;
      startInstance++;
    }
  });

  const serverConfig = _.cloneDeep(defaultServerConfig);

  for (let i = 0; i < networkConfig.nodesToScaleUp; i++) {
    const nodeConfig = _.cloneDeep(serverConfig);
    nodeConfig.server.ip.externalPort =
      networkConfig.startingExternalPort + existingInstances + i;
    nodeConfig.server.ip.internalPort =
      networkConfig.startingInternalPort + existingInstances + i;
    shell.mkdir(`shardus-instance-${nodeConfig.server.ip.externalPort}`);
    console.log(
      `Created server instance on folder <shardus-instance-${nodeConfig.server.ip.externalPort}>`
    );
    shell
      .ShellString(JSON.stringify(nodeConfig, null, 2))
      .to(`shardus-instance-${nodeConfig.server.ip.externalPort}/config.json`);
  }

  const instances = shell.ls("-d", `${instancesPath}/shardus-instance*`);
  for (let i = existingInstances; i < instances.length; i++) {
    await util.pm2Start(startConfig.serverPath, path.basename(instances[i]), {
      BASE_DIR: instances[i]
    });
  }
};
