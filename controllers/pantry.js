const itemRouter = require('express').Router()
const Item = require ('../models/item')
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

//get all pantry items for a given user
itemRouter.get('/', async (request, response) => {
    const items = await Item.find({})
    response.json(items)
})

//get a item by id
itemRouter.get('/:id', async (request, response, next) => {
    const item = await item.findById(request.params.id)
    if(item) {
        response.json(item)
    } else {
        response.status(404).end()
    }
})

itemRouter.get('/?user=:userid', async (request, response) => {
    const userid = request.params.userid

    const items = await Item.find({user: userid})
    console.log(items)
})

//post a new item
itemRouter.post('/', async (request, response, next) => {
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

    const item = new Item({
        name: body.name,
        quantity: body.quantity,
        unit: body.unit,
        expiry: body.expiry,
        user: user._id
    })

    const savedItem = await item.save()
    user.items = user.items.concat(savedItem._id)
    await user.save()

    response.status(201).json(savedItem)
})


//update item with given id with given item
itemRouter.put('/:id', async (request, response, next) => {
    const body = request.body
    const update = await Item.updateOne({id: request.params.id}, {name: body.name, quantity: body.quantity, unit: body.unit, expiry: body.expiry})
    
    const updatedItem = await updatedItem.findById(request.params.id)
    if (update) {
        response.status(200).json(updatedItem)
    } else {
        response.status(404).end()
    }
})

//delete item by id
itemRouter.delete('/:id', async (request, response) => {
    const token = getTokenFrom(request)
    const decodedToken = jwt.verify(token, process.env.SECRET)
    if (!decodedToken.id) {
        return response.status(402).json({ error: 'token missing or invalid' })
    }
    
    const user = await User.findById(decodedToken.id)
    if (user == null) {
        return response.status(400).json({error: 'invalid user Id'})
    }

    const deletedItem = await Item.findByIdAndDelete(request.params.id)

    if (deletedItem) {
        user.items = user.items.filter((item) => {item.id !== deletedItem.id})
        response.status(204).json(deletedItem)
    } else {
        response.status(404).end()
    }
})

module.exports = itemRouter