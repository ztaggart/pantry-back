const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log('Please provide the password as an argument: node mongo.js <password>')
  process.exit(1)
}

const password = process.argv[2]

const url = process.env.MONGODB_URI


mongoose.connect(url)

const recipeSchema = new mongoose.Schema({
  name: String,
  ingredients: String,
  directions: String,
})

const Recipe = mongoose.model('Recipe', recipeSchema)

const recipe = new Recipe({
  name: 'cereal',
  ingredients: 'milk, dry cereal',
  directions: 'Place cereal in a bowl and then add milk. It\'s not hard. Don\'t you dare put milk first.'
})

/*recipe.save().then(result => {
  console.log('recipe saved!')
  mongoose.connection.close()
})*/
Recipe.find({}).then(result => {
    result.forEach(recipe => {
      console.log(recipe)
    })
    mongoose.connection.close()
  })