// Printing normal log messages
const info = (...params) => {
    console.log(...params)
}

// Printing error messages
const error = (...error) => {
    console.log(...error)
}

module.exports = {
    info, error
}