// Libraries
const fs = require('fs')
const path = require('path')
const projectRoot = __dirname
// Scripts
const initialize = require(projectRoot + '/src/init')
const generate = require(projectRoot + '/src/generate')
const user = require(projectRoot + '/src/user')
// Statham types
const type = process.argv[2]
// Express some values
const values = process.argv
// Add a user
if (type === 'user') {
  user(values, true)
}
// Add a project
else if (type === 'project') {
  generate(values, true)
}
// Or just return the values passed
else {
  console.log(values)
}
