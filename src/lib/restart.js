const util = require("./util");
const shell = require("shelljs");
const path = require("path");
const fs = require("fs");
const archiverKeys = require("../configs/archiver-config");

// const pm2 = path.join(require.resolve('pm2', { paths: [path.join(__dirname, 'node_modules')] }), '../../.bin/pm2')

module.exports = async function (networkDir, options, args) {
    shell.cd(networkDir);
    const instancesPath = path.join(process.cwd());
    const configPath = path.join(instancesPath, "network-config.json");
    const networkConfig = JSON.parse(fs.readFileSync(configPath, "utf-8"));

    if (options.archivers) {
        const existingArchivers = JSON.parse(networkConfig.existingArchivers);
        let restartArchiverCount = parseInt(options.archivers);
        if (restartArchiverCount > 9) restartArchiverCount = 9;

        let stoppedArchivers = [];
        if (networkConfig.stoppedArchivers)
            stoppedArchivers = JSON.parse(networkConfig.stoppedArchivers);

        let activeArchivers = existingArchivers;
        let activeArchiversCalculated = false
        let port = 0;
        let newArchiversInfo = [];
        let newStoppedArchivers = [...stoppedArchivers]

        if (stoppedArchivers.length > 0) {
            let count = stoppedArchivers.length;
            if (restartArchiverCount <= stoppedArchivers.length) {
                count = restartArchiverCount
                restartArchiverCount = 0;
                newStoppedArchivers = newStoppedArchivers.slice(count, newStoppedArchivers.length)
            } else {
                restartArchiverCount -= stoppedArchivers.length;
                newStoppedArchivers = []
            }
            if (restartArchiverCount > 0) {
                if (restartArchiverCount > existingArchivers.length) {
                    restartArchiverCount = existingArchivers.length
                }
                activeArchivers = existingArchivers.slice(
                    restartArchiverCount,
                    existingArchivers.length
                );
                activeArchiversCalculated = true
            }

            for (let i = 0; i < count; i++) {
                port = stoppedArchivers[i].port - 4000;
                console.log("archive-server-" + (port + 1));
                newArchiversInfo.push({ ip: stoppedArchivers[i].ip, port: stoppedArchivers[i].port, publicKey: stoppedArchivers[i].publicKey })
                await util.pm2Restart(networkDir, `"archive-server-${port + 1}"`, {
                    ARCHIVER_PORT: stoppedArchivers[i].port,
                    ARCHIVER_PUBLIC_KEY: stoppedArchivers[i].publicKey,
                    ARCHIVER_SECRET_KEY: archiverKeys[port].secretKey,
                    ARCHIVER_EXISTING: JSON.stringify(activeArchivers),
                    ARCHIVER_DB: `archiver - db - ${stoppedArchivers[i].port}`,
                });
            }
        }

        if (existingArchivers.length > 0) {
            if (!activeArchiversCalculated) {
                if (restartArchiverCount > existingArchivers.length) {
                    restartArchiverCount = existingArchivers.length
                }
                activeArchivers = existingArchivers.slice(
                    restartArchiverCount,
                    existingArchivers.length
                );
                activeArchiversCalculated = true
            }
            // Restart archivers on ports following existingArchivers
            for (let i = 0; i < restartArchiverCount; i++) {
                port = existingArchivers[i].port - 4000;
                console.log("archive-server-" + (port + 1));
                newArchiversInfo.push({ ip: existingArchivers[i].ip, port: existingArchivers[i].port, publicKey: existingArchivers[i].publicKey })
                await util.pm2Restart(networkDir, `"archive-server-${port + 1}"`, {
                    ARCHIVER_PORT: existingArchivers[i].port,
                    ARCHIVER_PUBLIC_KEY: existingArchivers[i].publicKey,
                    ARCHIVER_SECRET_KEY: archiverKeys[port].secretKey,
                    ARCHIVER_EXISTING: JSON.stringify(activeArchivers),
                    ARCHIVER_DB: `archiver - db - ${existingArchivers[i].port}`,
                });
                port++;
            }
        }
        activeArchivers = [...activeArchivers, ...newArchiversInfo]
        activeArchivers.sort((a, b) => a.port - b.port)
        stoppedArchivers = newStoppedArchivers
        stoppedArchivers.sort((a, b) => a.port - b.port)

        networkConfig.existingArchivers = JSON.stringify(activeArchivers);
        networkConfig.stoppedArchivers = JSON.stringify(stoppedArchivers);
    } else if (options.archiverPort) {
        let archiverPortToRestart = parseInt(options.archiverPort)
        if (!(archiverPortToRestart > 4000 && archiverPortToRestart < 4010)) {
            console.log('The archiverPort is invalid')
            return
        }
        let existingArchivers = JSON.parse(networkConfig.existingArchivers)
        let stoppedArchivers
        if (networkConfig.stoppedArchivers)
            stoppedArchivers = JSON.parse(networkConfig.stoppedArchivers)
        else
            stoppedArchivers = []

        let archiverIsInActiveList = existingArchivers.filter(archiver => archiver.port === archiverPortToRestart)
        let archiverIsInStoppedList = stoppedArchivers.filter(archiver => archiver.port === archiverPortToRestart)
        if (archiverIsInStoppedList.length === 0 && archiverIsInActiveList.length === 0) {
            console.log(`The archiver with port ${archiverPortToRestart} is not in the running or stopped archiver list.`)
            return
        }

        let archiverIndex = archiverPortToRestart % 4000 + 1
        let archiverKeyIndex = archiverKeys.findIndex(archiver => archiver.port === archiverPortToRestart)

        let activeArchivers = existingArchivers.filter(archiver => archiver.port !== archiverPortToRestart)
        stoppedArchivers = stoppedArchivers.filter(archiver => archiver.port !== archiverPortToRestart)

        await util.pm2Restart(networkDir, `"archive-server-${archiverIndex}"`, {
            ARCHIVER_PORT: archiverKeys[archiverKeyIndex].port,
            ARCHIVER_PUBLIC_KEY: archiverKeys[archiverKeyIndex].publicKey,
            ARCHIVER_SECRET_KEY: archiverKeys[archiverKeyIndex].secretKey,
            ARCHIVER_EXISTING: JSON.stringify(activeArchivers),
            ARCHIVER_DB: `archiver - db - ${archiverKeys[archiverKeyIndex].port}`,
        });
        activeArchivers.push({ ip: archiverKeys[archiverKeyIndex].ip, port: archiverKeys[archiverKeyIndex].port, publicKey: archiverKeys[archiverKeyIndex].publicKey })
        activeArchivers.sort((a, b) => a.port - b.port)
        stoppedArchivers.sort((a, b) => a.port - b.port)
        networkConfig.existingArchivers = JSON.stringify(activeArchivers)
        networkConfig.stoppedArchivers = JSON.stringify(stoppedArchivers)
    } else if (args.num) {
        // const instances = shell.ls('-d', `${instancesPath}/shardus-instance*`)
        // let nodesToStart = num ? num : instances.length
        let restartConsensorCount = parseInt(args.num);
        let lowestPort = networkConfig.lowestPort;
        let stoppedConsensors;
        if (networkConfig.stoppedConsensors)
            stoppedConsensors = networkConfig.stoppedConsensors;
        else stoppedConsensors = [];
        for (let i = 0; i < restartConsensorCount; i++) {
            await util.pm2Restart(networkDir, `"shardus-instance-${lowestPort}"`);
            networkConfig.runningPorts.push(lowestPort);
        }
        networkConfig.runningPorts.forEach((port) => {
            if (num > 0) {
                util.pm2Restart(networkDir, `"shardus-instance-${port}"`);
                networkConfig.runningPorts = networkConfig.runningPorts.filter(
                    (p) => p !== port
                );
                stoppedConsensors.push(port);
            }
            num--;
        });
        networkConfig.stoppedConsensors = stoppedConsensors;
    }
    shell.ShellString(JSON.stringify(networkConfig, null, 2)).to(`network-config.json`)
};
