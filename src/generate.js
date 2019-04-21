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
const projectSchema = require(schemasPath + '/project.json')
const requestSchema = require(schemasPath + '/request.json')
// Istantiate database
let request
const storagePath = path.join(root, '..', 'storage')
const stathamDB = storagePath + '/stathams_projects.json'
const db = new loki(stathamDB)
const initialize = require(path.join(root, '..', 'src/init.js'))
// Return an object for the request
const generate = (input, isProject) => {
  // Name the object
  const name = input[3]
  let isValidRequest
  let isValidProject
  // Validate the request
  const validRequest = ajv.compile(requestSchema)
  isValidRequest = validRequest(input)
  if (isValidRequest) {
    // Add properties
    request = {}
    request.name = name
    // For each object add their values
    for (let i = 4; i < input.length; i += 1) {
      if (input[i].match(/[\[\]\{\}]{1,}/g) !== null) {
        request[input[i-1]] = JSON.parse(input[i])
      } else {
        request[input[i]] = {}
      }
    }
  } else {
    console.log(validRequest.errors)
  }
  // Validate the project
  const validProject = ajv.compile(projectSchema)
  let projects
  let record
  isValidProject = validProject(request)
  // If this is a project
  if (isProject) {
    // Create database
    db.loadDatabase({}, () => {
      // Initialize collection
      projects = db.getCollection('projects')
      if (!projects)
      projects = db.addCollection('projects')
      console.log('Initialize projects: ', projects.data)
      // Find the project if it exists
      const searchIfExist = projects.find({ 'name' : name })
      const doesExist = (searchIfExist[0] !== undefined) ? true : false
      // If it exists ask the user to provide another name
      if (doesExist) {
        console.log('A project by this name already exists. Please provide another one.')
      } else {
        if (isValidProject) {
          // Insert package
          projects.insert(request)
          console.log('Added project: ', request.name)
          // Save database
          db.saveDatabase()
          setTimeout(() => {
            initialize(name)
          }, 1000)
        } else {
          console.log(validProject.errors)
        }
      }
    })
  } else {
    return request
  }
}
module.exports = generate
