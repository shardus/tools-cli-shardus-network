const util = require('./util')
const shell = require('shelljs')
const fs = require('fs')
const path = require('path')

module.exports = async (reference, instancesPath) => {
    util.pm2Stop(reference, instancesPath)
}