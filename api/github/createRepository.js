// Libraries
const fs = require('fs')
const path = require('path')
const { exec } = require('child_process')
const root = __dirname
const loki = require('lokijs')
const Ajv = require('ajv')
const ajv = new Ajv
const dateFormat = require('dateformat')
const now = new Date()
const github = require('octonode')
// Database
const ghInfo = require(path.join(root, '../../', 'configs', 'github.json'))
const storagePath = path.join(root, '../../', 'storage')
const stathamDB = storagePath + '/stathams_user.private.json'
const db = new loki(stathamDB)
let users
let user
let gitUser
let client
let gitSudo
let repository
// Return repository based on request
// Create development environment
const createRepository = (input, isGitHub) => {
  // If is gitHub request
  if (isGitHub) {
    // Create database
    db.loadDatabase({}, () => {
      // Initialize collection
      users = db.getCollection('users')
      // User
      user = users.findObject()
      // gitHub info
      gitUser = user.info.github
      // Make gitHub request
      client = github.client({
         username: gitUser.user,
         password: gitUser.password
      })
      // My git user
      gitSudo = client.me()
      // Create repository
      gitSudo.repo({
        name: input.name
      }, () => {
        const ghRepoUrl = ghInfo.url + '/' + gitUser.user + '/' + input.name
        console.log('Created Project in GitHub: ' + ghRepoUrl )
        // Set up Master branch
        const setUpMasterEnvironment =
          ghInfo.commands.addOrigin + ghRepoUrl + ' && ' +
          ghInfo.commands.addAll + ' && ' +
          ghInfo.commands.commit + '"Initial Commit"' + ' && ' +
          ghInfo.commands.pushOriginMaster
        exec(setUpMasterEnvironment, (error) => {
          if (error) { return console.log(error) }
        })
      })
    })
  }
}
module.exports = createRepository
