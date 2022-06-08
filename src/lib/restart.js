const util = require("./util");
const shell = require("shelljs");
const path = require("path");
const fs = require("fs");
const archiverKeys = require('../configs/archiver-config')

// const pm2 = path.join(require.resolve('pm2', { paths: [path.join(__dirname, 'node_modules')] }), '../../.bin/pm2')

module.exports = async function (networkDir, options) {
    shell.cd(networkDir);
    const instancesPath = path.join(process.cwd());
    const configPath = path.join(instancesPath, "network-config.json");
    const networkConfig = JSON.parse(fs.readFileSync(configPath, "utf-8"));

    const existingArchivers = JSON.parse(networkConfig.existingArchivers)

    if (options.archivers) {
        let restartArchiverCount = parseInt(options.archivers)
        if (restartArchiverCount > 9) restartArchiverCount = 9

        if (existingArchivers.length > restartArchiverCount) {
            const activeArchivers = existingArchivers.slice(restartArchiverCount, existingArchivers.length)
            // Restart archivers on ports following existingArchivers
            for (let i = 0; i < restartArchiverCount; i++) {
                console.log("archive-server-" + (i + 1), activeArchivers)
                await util.pm2Restart(
                    networkDir,
                    `"archive-server-${i + 1}"`,
                    {
                        ARCHIVER_PORT: existingArchivers[i].port,
                        ARCHIVER_PUBLIC_KEY: existingArchivers[i].publicKey,
                        ARCHIVER_SECRET_KEY: archiverKeys[i].secretKey,
                        ARCHIVER_EXISTING: JSON.stringify(activeArchivers),
                        ARCHIVER_DB: `archiver - db - ${existingArchivers[i].port}`
                    },
                )
            }
        }
    }
};
