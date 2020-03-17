const express = require('express')

// Create express instance
const app = express()

// Require API routes
const clash = require('./routes/clash')

// Import API Routes
app.use(clash)

// Export the server middleware
module.exports = {
  path: '/api',
  handler: app
}
