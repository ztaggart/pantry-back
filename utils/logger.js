const error = (...params) => {
    console.log(...params)
}

const info = (...params) => {
    console.error(...params)
}

module.exports = {
    info, error
}