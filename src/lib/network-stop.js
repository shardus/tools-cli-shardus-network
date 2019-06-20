const util = require('./util')
const shell = require('shelljs')
const fs = require('fs')
const path = require('path')

module.exports = async (reference) => {
    util.pm2Stop(reference)
}