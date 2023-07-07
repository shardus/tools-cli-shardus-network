module.exports = {
  numberOfNodes: 10,
  serverPath: 'index.js',
  startingExternalPort: 9001,
  startingInternalPort: 10001,
  lowestPort: 9001,
  highestPort: 9001,
  instancesPath: 'instances',
  archivers: 1,
  startArchiver: true,
  monitorUrl: 'http://127.0.0.1:3000/api',
  startMonitor: true,
  explorerServerPort: 4444,
  explorerServerAddr: '127.0.0.1',
  startExplorerServer: false,
  logSize: 10,
  logNum: 10
  // explorerClientPort: 5001,
  // explorerClientAddr: '127.0.0.1',
  // startExplorerClient: true
}
