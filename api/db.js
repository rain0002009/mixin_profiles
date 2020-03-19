const path = require('path')
const low = require("lowdb")
const FileSync = require('lowdb/adapters/FileSync')
const dbPath = path.resolve(__dirname, '.', '../storage/db.json')
const adapter = new FileSync(dbPath)
const db = low(adapter)
console.log(dbPath, '数据库路径')
db.defaults({
  userProfiles: {}
}).write()
module.exports = db
