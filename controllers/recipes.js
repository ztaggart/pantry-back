const recipeRouter = require('express').Router()
const Recipe = require ('../models/recipe')
const User = require('../models/user')
const jwt = require('jsonwebtoken')

const getTokenFrom = (request) => {
    const auth = request.get('Authorization')
    if (auth && auth.toLowerCase().startsWith('bearer ')) {
        return auth.substring(7)
    } else {
        return null
    }
}

//get all recipes
recipeRouter.get('/', async (request, response) => {
    const recipes = await Recipe.find({})
    response.json(recipes)
})

//get a recipe by id
recipeRouter.get('/:id', async (request, response, next) => {
    const recipe = await Recipe.findById(request.params.id)
    if(recipe) {
        response.json(recipe)
    } else {
        response.status(404).end()
    }
})

//post a new recipe
recipeRouter.post('/', async (request, response, next) => {
    console.log("here")
    const body = request.body

    const token = getTokenFrom(request)
    const decodedToken = jwt.verify(token, process.env.SECRET)
    if (!decodedToken.id) {
        return response.status(402).json({ error: 'token missing or invalid' })
    }
    
    const user = await User.findById(decodedToken.id)
    if (user == null) {
        return response.status(400).json({error: 'invalid user Id'})
    }

    const recipe = new Recipe({
        name: body.name,
        ingredients: body.ingredients,
        directions: body.directions,
        user: user._id
    })

    const savedRecipe = await recipe.save()
    user.recipes = user.recipes.concat(savedRecipe._id)
    await user.save()

    response.status(201).json(savedRecipe)
})

//delete recipe by id
recipeRouter.delete('/:id', async (request, response) => {
    const recipe = await Recipe.findByIdAndDelete(request.params.id)

    if (recipe) {
        response.status(204).json(recipe)
    } else {
        response.status(404).end()
    }
})

module.exports = recipeRouter