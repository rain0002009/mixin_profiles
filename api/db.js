const path = require('path')
const low = require("lowdb")
const FileSync = require('lowdb/adapters/FileSync')
const adapter = new FileSync(path.resolve(__dirname, '.', '../storage/db.json'))
const db = low(adapter)
db.defaults({
  userProfiles: {}
}).write()
module.exports = db
