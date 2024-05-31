const { describe, test, beforeEach, after } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const helper = require('./helpers/user_helper')
const User = require('../models/user')
const app = require('../app')
const supertest = require('supertest')
const bcrypt = require('bcrypt')
const api = supertest(app)


describe.only('when there is initially only one user in the DB', () => {
    beforeEach(async () => {
        await User.deleteMany({})

        const passwordHash = await bcrypt.hash('secret', 10)
        const user = new User({ username: 'root', name: 'Root User', passwordHash })

        await user.save()
    })
    
    // Successful operations
    test.only('successful user creation when all requirements are met', async () => {
        const usersAtStart = await helper.usersInDb()

        const userToAdd = {
            username: 'success',
            name: 'Successful user',
            password: 'success'
        }

        await api
            .post('/api/users')
            .send(userToAdd)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        const usersAtEnd = await helper.usersInDb()

        assert.strictEqual(usersAtEnd.at(-1).username, userToAdd.username)

        assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1)
    })

    // Unsuccessful Operations
    test.only('unsuccessful invalid user (invalid name) creation', async () => {
        const usersAtStart = await helper.usersInDb()

        const invalidNameUser = {
            username: "da",
            name: "Lord Darksied",
            password: 'darksied'
        }

        await api
            .post('/api/users')
            .send(invalidNameUser)
            .expect(400)
            .expect('Content-Type', /application\/json/)

        const usersAtEnd = await helper.usersInDb()
        assert.strictEqual(usersAtStart.length, usersAtEnd.length)

    })

    test.only('unsuccessful invalid add operation(non-unique username)', async () => {
        const usersAtStart = await helper.usersInDb()

        const duplicateUser = {
            username: 'root',
            name: 'Root Johnson',
            password: 'johnson'
        }

        const result = await api
            .post('/api/users')
            .send(duplicateUser)
            .expect(400)
            .expect('Content-Type', /application\/json/)

        const usersAtEnd = await helper.usersInDb()

        assert(result.body.error.includes('expected `username` to be unique'))

        assert.strictEqual(usersAtStart.length, usersAtEnd.length)
    })

    test.only('unsuccessful invalid user (short password) creation', async () => {
        const usersAtStart = await helper.usersInDb()

        const invalidPwUser = {
            username: "invalid",
            name: "Invalid user",
            password: 'as'
        }

        const result = await api
            .post('/api/users')
            .send(invalidPwUser)
            .expect(400)
            .expect('Content-Type', /application\/json/)

        const usersAtEnd = await helper.usersInDb()
        assert(result.body.error.includes('password length is too short'))

        assert.strictEqual(usersAtStart.length, usersAtEnd.length)
    })

})

after(async () => {
    await mongoose.connection.close()
  })
