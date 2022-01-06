const errorHandler = (error, request, response, next) => {
    console.log(error.message)

    switch (error) {
        case error.name === 'CastError':
            return response.status(400).send({error: 'malformatted id'})
        case error.name === 'ValidationError':
            return response.status(400).send({error: error.message})
    }

    next(error)
}
module.exports = errorHandler