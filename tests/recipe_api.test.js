const mongoose = require('mongoose')
const supertest = require('supertest')
const bcrypt = require('bcrypt')
const axios = require('axios')
const jwt = require('jsonwebtoken')

const app = require('../app')
const api = supertest(app)
const Recipe = require('../models/recipe')
const User = require('../models/user')
const helper = require('../tests/test_helper')


let bearerToken

beforeEach(async () => {
    await Recipe.deleteMany({})
    await User.deleteMany({})

    const pwHash = await bcrypt.hash('bad_password', 10)
    let userObject = new User({username: "hungry_man", passwordHash: pwHash})
    await userObject.save()

    const users = await helper.usersInDb()
    const userId = users[0].id

    const userForToken = {
        username: "hungry_man",
        id: userId,
    }

    bearerToken = "bearer " + jwt.sign(userForToken, process.env.SECRET)

    /*
    Incorrect way to add elements to database:
    helper.initialRecipes.forEach(async (recipe) => {
        let recipeObject = new Recipe(recipe)
        await recipeObject.save()
        // further things ...
    })
    
    The await only applies to the rest of the forEach block, meaning anything in "further things", NOT past the forEach loop
    To fix this, there are two solutions:

    ## Promise Array:

    const recipeObjects = helper.initialRecipies.map(recipe => new Recipe(recipe))
    const promiseArray = recipeObjects.map(recipe => recipe.save())
    await Promise.all(promiseArray)

    This creates a list of promises and passes it into Proimse.all, where it is turned into a single promise, and awaited

    ## For block
    
    A much conceptually easier solution (in my opinion) is just to loop through a for block (not forEach)
    This guarentees a specific execution order, so it can also be used when promises need to be executed in a certain order.
    */

    for (let recipe of helper.initialRecipes) {
        let recipeObject = new Recipe(recipe)
        await recipeObject.save()
    }
})

test('recipes are returned as json', async () => {
    await api.get('/api/recipes').expect(200).expect('Content-Type', /application\/json/)
})

test('there are two recipes', async () => {
    const recipes = await helper.recipesInDB()
    expect(recipes).toHaveLength(helper.initialRecipes.length)
})

test('a specific recipe is returned', async () => {
    const recipesAtStart = await helper.recipesInDB()

    const recipe = recipesAtStart[0]

    const result = await api.get(`/api/recipes/${recipe.id}`).expect(200).expect('Content-Type', /application\/json/)
    const processedRecipe = JSON.parse(JSON.stringify(recipe))
    expect(result.body).toEqual(processedRecipe)
})

test('a recipe can be deleted', async () => {
    const recipesAtStart = await helper.recipesInDB()
    const recipe = recipesAtStart[0]

    await api.delete(`/api/recipes/${recipe.id}`).expect(204)

    const recipesAtEnd = await helper.recipesInDB()

    expect(recipesAtEnd.length).toEqual(recipesAtStart.length - 1) 
})

test('a valid recipe can be added', async () => {
    const testName = "test name"
    const testIngredients = "ingredients, ingredients"
    const testDirections = "directions"
    const users = await helper.usersInDb()
    const testUserId = users[0].id

    const newRecipe = {
        name: testName,
        ingredients: testIngredients,
        directions: testDirections,
        userId: testUserId
    }

    await api
        .post('/api/recipes')
        .set({'Content-Type': 'application/json', 'Authorization': bearerToken})
        .send(newRecipe)
        .expect(201)
        .expect('Content-Type', /application\/json/)

    
    const response = await helper.recipesInDB()

    expect(response).toHaveLength(helper.initialRecipes.length + 1)

    const recipeNames = response.map(recipe => recipe.name)
    expect(recipeNames).toContain(testName)
    const ingredients = response.map(recipe => recipe.ingredients)
    expect(ingredients).toContain(testIngredients)
    const directions = response.map(recipe => recipe.directions)
    expect(directions).toContain(testDirections)
})

test('recipe without name is not added', async () => {
    const users = await helper.usersInDb()
    const testUserId = users[0].id

    const newRecipe = {
        directions: 'test',
        ingredients: 'test',
        usedId: testUserId
    }

    await api
        .post('/api/recipes')
        .set({'Content-Type': 'application/json', 'Authorization': bearerToken})
        .send(newRecipe)
        .expect(400)

    const response = await helper.recipesInDB()
    expect(response).toHaveLength(helper.initialRecipes.length)
})

afterAll(() => {
    mongoose.connection.close()
})
