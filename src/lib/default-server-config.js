module.exports = {
    name: "Simple Coin Application",
    version: "1.0.0",
    server: {
        baseDir: "./",
        p2p: {
            cycleDuration: 15,
            seedList: "http://127.0.0.1:4000/api/seednodes",
            maxNodesPerCycle: 5,
            minNodes: 15,
            maxNodes: 20,
            maxNodesToRotate: 1,
            maxPercentOfDelta: 40
        },
        ip: {
            externalIp: "127.0.0.1",
            externalPort: 9001,
            internalIp: "127.0.0.1",
            internalPort: 10000
        },
        loadDetection: {
            queueLimit: 1000,
            desiredTxTime: 15,
            highThreshold: 0.8,
            lowThreshold: 0.2
        },
        stateManager: {
            stateTableBucketSize: 200,
            accountBucketSize: 50
        },
        reporting: {
            report: true,
            recipient: "http://127.0.0.1:3000/api",
            interval: 2,
            console: false
        }
    }
}