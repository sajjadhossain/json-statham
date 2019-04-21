// Libraries
const path = require('path')
const Ajv = require('ajv')
const ajv = new Ajv
const assert = require('assert')
// Schema
const groceriesSchema = require(path.join('..', 'schemas','groceries.json'))
// Functions
const groceries = require(path.join('..', 'index.js'))
// Total for my groceries
const apple = 1.19
const total = groceries(2, 'apple')
const expectedTotal = parseFloat(apple) * 2
const actualTotal = total.total
// Validate my total
const validateGroceries = ajv.compile(groceriesSchema)
const isTotalValid = validateGroceries(total)
// Assert groceries are valid
describe('Groceries', () => {
  it('should generate a valid object', () => {
    assert(isTotalValid, true)
  })
  it('should generate a correct total', () => {
    assert(expectedTotal, actualTotal)
  })
})
