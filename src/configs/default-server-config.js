module.exports = {
  server: {
    baseDir: ".",
    p2p: {},
    ip: {
      externalIp: "127.0.0.1",
      externalPort: 9001,
      internalIp: "127.0.0.1",
      internalPort: 10000,
    },
    reporting: {
      report: true,
      recipient: "http://127.0.0.1:3000/api",
      interval: 2,
      console: false,
    },
  },
}
