require('dotenv').config()
const http = require('http')
const cors = require('cors')
const express = require('express')
const app = express()
const mongoose = require('mongoose')
const Recipe = require('./models/recipe')

app.use(express.json())
app.use(cors())
app.use(express.static('build'))

const errorHandler = require('./errorHandler')
const requestLogger = (request, response, next) => {
    console.log('Method:', request.method)
    console.log('Path:  ', request.path)
    console.log('Body:  ', request.body)
    console.log('---')
    next()
    console.log('after next')
}

app.use(requestLogger)

//basic ping
app.get('/', (request, response) => {
    response.send('<h1>Hello World!</h1>')
})
  
//get all recipes
app.get('/api/recipes', (request, response) => {
    console.log("in recipes")
    Recipe.find({}).then(recipes => response.json(recipes))
})

//get a recipe by id
app.get('/api/recipes/:id', (request, response, next) => {
    Recipe.findById(request.params.id).then(recipe => {
        if(recipe) {
            response.json(recipe)
        } else {
            response.status(404).end()
        }
    })
    .catch(error => {
        next(error)
    })
})

//post a new recipe
app.post('/api/recipes', (request, response, next) => {
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
app.delete('/api/recipes/:id', (request, response, next) => {
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

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}
  
app.use(unknownEndpoint)

//MUST be last middleware, any other that get added must be above this
app.use(errorHandler);

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})