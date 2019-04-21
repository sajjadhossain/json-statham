// Libraries
const fs = require('fs')
const path = require('path')
const root = __dirname
const loki = require('lokijs')
const Ajv = require('ajv')
const ajv = new Ajv
const dateFormat = require('dateformat')
const now = new Date()
// Schemas
const schemasPath = path.join(root, '..', 'schemas')
const userSchema = require(schemasPath + '/user.json')
// Database
const storagePath = path.join(root, '..', 'storage')
const stathamDB = storagePath + '/stathams_user.private.json'
const db = new loki(stathamDB)
// Return user based on request
const user = (input, isUser) => {
  let users
  let newUser
  let fullName
  newUser = {}
  newUser.name = {}
  newUser.name.fullName = []
  newUser.name.middleNames = []
  newUser.info = {}
  // For each object add their values
  for (let i = 3; i < input.length; i += 1) {
    const isInfo = (input[i].match(/[\[\]\{\}]{1,}/g) !== null) ? true : false
    // If name, else info
    newUser.name.firstName = input[3]
    newUser.name.lastName = input[input.length - 2]
    if (!isInfo) {
      newUser.name.fullName.push(input[i].charAt(0).toUpperCase() + input[i].slice(1))
      if (input[i] !== input[3] && input[i] !== input[input.length - 2]) {
        newUser.name.middleNames.push(input[i])
      }
    } else {
      newUser.info.email = JSON.parse(input[i]).email
      newUser.info.github = JSON.parse(input[i]).git
    }
  }
  fullName = newUser.name.fullName.join(' ')
  newUser.user = fullName
  if (isUser) {
    // Validate the user
    const validUser = ajv.compile(userSchema)
    const isValidUser = validUser(newUser)
    // Create database
    db.loadDatabase({}, () => {
      // Initialize collection
      users = db.getCollection('users')
      if (!users)
      users = db.addCollection('users')
      console.log('Initialize users: ', users.data)
      // Find the user if it exists
      const searchIfExist = users.find({ 'user': fullName })
      const doesExist = (searchIfExist[0] !== undefined) ? true : false
      // If it exists ask the user to provide another name
      if (doesExist) {
        console.log('A user by this name already exists. Please provide another one.')
      } else {
        if (isValidUser) {
          // Insert user
          users.insert(newUser)
          console.log('Added user: ', newUser.user)
          // Save database
          db.saveDatabase()
        } else {
          console.log(validUser.errors)
        }
      }
    })
  }
}
module.exports = user
