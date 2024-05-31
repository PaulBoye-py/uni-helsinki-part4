require ('dotenv').config()
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const loginRouter = require('express').Router()
const User = require('../models/user')

loginRouter.post('/', async (request, response) => {
    const { username, password } = request.body

    // check if the username and password are in the Db
    const user = await User.findOne({ username })
    const passwordCorrect = user === null
        ? false
        : await bcrypt.compare(password, user.passwordHash)

    if (!(user && passwordCorrect)) {
        return response.status(401).json({ error: 'invalid username or password' })
    }

    // create a token for the user and send to the frontend
    const userToken = {
        username: user.username,
        id: user._id,
    }

    // token should expire in 1 hour (60*60)
    const token = jwt.sign(
        userToken,
        process.env.SECRET,
        {expiresIn: 60*60}
    )

    response.
        status(200)
        .send({ token, username: user.username, name: user.name })
})

module.exports = loginRouter