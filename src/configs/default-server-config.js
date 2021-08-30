module.exports = {
    server: {
        baseDir: ".",
        p2p: {
            existingArchivers: [
                {
                    "ip": "127.0.0.1",
                    "port": 4000,
                    "publicKey": "758b1c119412298802cd28dbfa394cdfeecc4074492d60844cc192d632d84de3"
                },
                {
                    "ip": "127.0.0.1",
                    "port": 4001,
                    "publicKey": "e4b5e3d51e727f897786a1bb176a028ecfe1941bfa5beefd3c6209c3dbc07cf7"
                }
            ],
        },
        ip: {
            externalIp: "127.0.0.1",
            externalPort: 9001,
            internalIp: "127.0.0.1",
            internalPort: 10000
        },
        reporting: {
            report: true,
            recipient: "http://127.0.0.1:3000/api",
            interval: 2,
            console: false
        }
    }
}