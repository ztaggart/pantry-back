const recipeRouter = require('express').Router()
const Recipe = require ('../models/recipe')
//get all recipes
recipeRouter.get('/', (request, response) => {
    console.log('in recipes')
    Recipe.find({}).then(recipes => {
        response.json(recipes.map(note => note.toJSON()))
    })
})

//get a recipe by id
recipeRouter.get('/:id', (request, response, next) => {
    Recipe.findById(request.params.id).then(recipe => {
        if(recipe) {
            response.json(recipe)
        } else {
            response.status(404).end()
        }
    }).catch(error => {
        next(error)
    })
})

//post a new recipe
recipeRouter.post('/', (request, response, next) => {
    const body = request.body

    /*if (body.name === undefined) {
        return response.status(400).json({ error: 'name missing' })
    } else if (body.ingredients === undefined) {
        return response.status(400).json({ error: 'ingredients missing'})
    } else if (body.directions === undefined) {
        return response.status(400).json({ error: 'directions missing'})
    }*/

    const recipe = new Recipe({
        name: body.name,
        ingredients: body.ingredients,
        directions: body.directions
    })

    recipe.save()
        .then(recipe => response.json(recipe))
        .catch(error => next(error))
})

//delete recipe by id
recipeRouter.delete('/:id', (request, response, next) => {
    console.log('ping in delete')
    Recipe.findByIdAndDelete(request.params.id).then(recipe => {
        if (recipe) {
            response.json(recipe)
            response.status(204).end()
        } else {
            response.status(404).end()
        }
    })
        .catch(error => {
            next(error)
        })
})

module.exports = recipeRouter