const { response } = require('../../app')
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

const usersInDb = async () => {
    const users = await User.find({})
    return users.map(u => u.toJSON())
}

module.exports = {
    initialUsers,
    usersInDb
}