require ('dotenv').config()
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const User = require('../../models/user')

const initialUsers = [
    {
        username: 'dillion',
        name: 'Dillion Megida',
        password: 'dillion'
    },
    {
        username: 'angel',
        name: 'Angel DiMaria',
        password: 'angel'
    }
]

const generateToken = async () => {
    const passwordHash = await bcrypt.hash('secret', 10)
    const user = new User({ username: 'admin', name: 'Root User', passwordHash })
    await user.save()

    const userForToken = {
        username: user.username,
        id: user._id
    }

    return jwt.sign(userForToken, process.env.SECRET, { expiresIn: 60*60})
}

const mockUserExtractor = async (request, response, next) => {
    const token = await generateToken()
    request.token = token

    try {
        const decodedToken = jwt.verify(token, process.env.SECRET)
        if (decodedToken.id) {
            request.user = await User.findById(decodedToken.id)
        }
    } catch (error) {
        return response.status(401).json({ error: 'token invalid' })
    }

    next()
}


const usersInDb = async () => {
    const users = await User.find({})
    return users.map(u => u.toJSON())
}

module.exports = {
    initialUsers,
    usersInDb,
    generateToken,
    mockUserExtractor,
}