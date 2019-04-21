const groceries = (thisMany, item) => {
  // Total to return
  let total
  // Price of item to be determined
  let priceOfItem
  // If apple
  if (item === 'apple') {
    priceOfItem = 1.19
    total = (parseFloat(priceOfItem) * parseInt(thisMany))
  } else {
    return 'I only sell apples, boss.'
  }
  // Return total object
  return { thisMany, item, total }
}
module.exports = groceries
