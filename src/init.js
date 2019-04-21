const fs = require('fs')
const path = require('path')
const { exec } = require('child_process')
const root = __dirname
const loki = require('lokijs')
const request = require('request')
const createRepository = require(path.join(root, '../api/github', 'createRepository.js'))
// Retrieve database
const storagePath = path.join(root, '..', 'storage')
const stathamDB = storagePath + '/stathams_projects.json'
const db = new loki(stathamDB)
// Retrieve data
const projectTemplate = path.join(root, '..', 'src/templates/project')
const licensePath = path.join(root, '..', 'src/templates/project', 'LICENSE')
const licenseContent = fs.readFileSync(licensePath, 'utf8')
const indexPath = path.join(root, '..', 'src/templates/project', '/index.js')
const indexContent = fs.readFileSync(indexPath, 'utf8')
const testPath = path.join(root, '..', 'src/templates/project', '/test/index.spec.js')
const testContent = fs.readFileSync(testPath, 'utf8')
const schemaPath = path.join(root, '..', 'src/templates/project', '/schemas/groceries.json')
const schemaContent = fs.readFileSync(schemaPath, 'utf8')
let config
let readMeContent
let gitIgnoreContent
let packageJSONContent
// Make data
const files = {
  license: 'LICENSE',
  readme: 'README.md',
  gitignore: '.gitignore',
  test: 'test/index.spec.js',
  schema: 'schemas/groceries.json',
  index: 'index.js'
}
// Initialize based on parameters
const initialize = (name) => {
  // Load database
  let recordToInit
  db.loadDatabase({}, () => {
    const projects = db.getCollection('projects')
    // Select my item
    recordToInit = projects.findObject({ 'name' : name })
    // If node and git true
    if (recordToInit.config.node && recordToInit.config.git) {
      // Set config
      config = require(path.join(root, '..', 'configs', 'node.json'))
      // Generate readme
      readMeContent = '# ' + recordToInit.name
      // Get .gitignore
      request(config.gitignore, { json: true }, (error, response, body) => {
        if (error) { return console.log(error) }
        // Generate .gitignore
        gitIgnoreContent = body
        // Update this record in the database
        recordToInit.files.push({ names: files })
        projects.update(recordToInit)
        console.log('Updated project files: ', JSON.stringify(recordToInit.files))
        // Save database
        db.saveDatabase()
        // Create a repository
        createRepository(recordToInit, true)
        // Make directory
        const directory = recordToInit.config.path + '/' + name
        const mkdirCommand = 'mkdir ' + directory
        exec(mkdirCommand, (error) => {
          if (error) { return console.log(error) }
        })
        // Copy and touch files
        const copyFiles =
          'cp -r ' + projectTemplate + '/* ' + directory + ' && ' +
          'touch ' + recordToInit.config.path + '/' + name + '/' + files.gitignore + ' && ' +
          'echo "' + gitIgnoreContent + '" >> ' + recordToInit.config.path + '/' + name + '/' + files.gitignore
        exec(copyFiles, (error) => {
          if (error) { return console.log(error) }
        })
        const initializeDirectory =
          'cd ' + directory + ' && ' +
          'git init && ' +
          config.command + ' && ' +
          config.install
        exec(initializeDirectory, (error) => {
          if (error) { return console.log(error) }
        })
      })
    }
  })
}
module.exports = initialize
