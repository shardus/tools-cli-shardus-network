module.exports = {
  numberOfNodes: 10,
  serverPath: 'index.js',
  startingExternalPort: 9001,
  startingInternalPort: 10001,
  lowestPort: 9001,
  highestPort: 9001,
  instancesPath: 'instances',
  archivers: 1,
  existingArchivers: `[
    {
      "ip": "127.0.0.1",
      "port": 4000,
      "publicKey": "758b1c119412298802cd28dbfa394cdfeecc4074492d60844cc192d632d84de3"
    }
  ]`,
  startArchiver: true,
  monitorUrl: 'http://127.0.0.1:3000/api',
  startMonitor: true,
  explorerServerPort: 4444,
  explorerServerAddr: '127.0.0.1',
  startExplorerServer: true,
  logSize: 10,
  logNum: 10
  // explorerClientPort: 5001,
  // explorerClientAddr: '127.0.0.1',
  // startExplorerClient: true
}
