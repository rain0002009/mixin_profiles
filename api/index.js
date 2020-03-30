const express = require('express')
const {
  createProxyMiddleware
} = require('http-proxy-middleware')
const options = {
  target: process.env.apiUrl || 'http://localhost:1337',
  changeOrign: true,
  pathRewrite: {
    '^/api': ''
  }
}
const apiProxy = createProxyMiddleware(options)

// Create express instance
const app = express()
app.use(apiProxy)
// Export the server middleware
module.exports = {
  path: '/api',
  handler: app
}
