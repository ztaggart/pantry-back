const Recipe = require('../models/recipe')
const User = require('../models/user')

const initialRecipes = [
    {
        name: 'cereal',
        ingredients: 'milk, dry cereal',
        directions: 'put the cereal in the bowl, and then add milk.'
    }, 
    {
        name: 'gabbagoul',
        ingredients: 'gabbagoul, side salad',
        directions: 'i want gabbagoul with the side salad. if it comes on top, I send it back.'
    }
]

const nonExistingId = async () => {
  const recipe = new Recipe({ content: 'willremovethissoon', date: new Date() })
  await recipe.save()
  await recipe.remove()

  return recipe._id.toString()
}

const recipesInDB = async () => {
  const recipe = await Recipe.find({})
  return recipe.map(recipe => recipe.toJSON())
}

const usersInDb = async () => {
  const users = await User.find({})
  return users.map(u => u.toJSON())
}

module.exports = {
  initialRecipes, nonExistingId, recipesInDB, usersInDb
}