const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')

// Add a new user
usersRouter.post('/', async (request, response) => {
    const { name, username, password } = request.body

    if (password.length < 3) {
        response.status(400).send({ error: 'password length is too short' })
        return 
    }

    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)

    const user = new User ({
        username,
        name,
        passwordHash
    })

    const savedUser = await user.save()

    response.status(201).json(savedUser)

})

// View all users
usersRouter.get('/', async (request, response) => {
    const users = await User
        .find({}).populate('blogs', { url: 1, title: 1, author: 1 })
    response.json(users)
})

module.exports = usersRouter