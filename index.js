const http = require('http')
const cors = require('cors')
const express = require('express')
const app = express()

app.use(express.json())
app.use(cors())
app.use(express.static('build'))

let recipes = [
    {
        "id": 1,
        "name": "oatmeal with strawberries",
        "ingredients": "dried oats, strawberries, milk",
        "directions": "Stir in oats, milk, and salt and cook, stirring frequently, until oatmeal is creamy and thickened, about 3 minutes. When done, mix in strawberries."
      },
      {
        "id": 2,
        "name": "cereal",
        "ingredients": "milk, dry cereal",
        "directions": "Place cereal in a bowl and then add milk. It's not hard. Don't you dare put milk first."
      },
      {
        "id": 3,
        "name": "salad",
        "ingredients": "romaine lettuce, tomatoes, carrots, cucumber, other vegetables, dressing",
        "directions": "Toss all vegetables until evenly spread. Then add dressing of your choosing."
      }

]

app.get('/', (request, response) => {
    response.send('<h1>Hello World!</h1>')
})
  
app.get('/api/recipes', (request, response) => {
    response.json(recipes)
})

app.get('/api/recipe/:id', (request, response) => {
    const id = Number(request.params.id);
    const recipe = recipes.find(recipe => recipe.id === id)
    if(recipe === undefined) {
        response.status(404).end;
    }

    response.json(recipe)
    
})

app.delete('/api/recipes/:id', (request, response) => {
    const id = Number(request.params.id)
    recipes = recipes.filter(recipe => recipe.id !== id)
  
    response.status(204).end()
})

app.post('/api/recipes', (request, response) => {
    const recipe = request.body
    console.log(recipe)
    response.json(recipe)
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})