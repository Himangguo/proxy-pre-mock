const webpack5Middleware = require('./src/webpack5-middleware')
const vite5Plugin = require('./src/vite5-middleware')
const {addMock} = require('./src/app')

exports.webpack5Middleware = webpack5Middleware
exports.vite5Plugin = vite5Plugin
exports.addMock = addMock

