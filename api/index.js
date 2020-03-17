const express = require('express')

// Create express instance
const app = express()
app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({
  extended: true
})) // for parsing application/x-www-form-urlencoded
// Require API routes
const clash = require('./routes/clash')

// Import API Routes
app.use(clash)

// Export the server middleware
module.exports = {
  path: '/api',
  handler: app
}
