const { test, after, beforeEach, before, describe } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const helper = require('./helpers/user_helper')
const Blog = require('../models/blog')
const User = require('../models/user')
const supertest = require('supertest')
const app = require('../app')

const api = supertest(app)

const initialBlogs = [
    {
        title: "Setting up a node environment",
        author: "Paul Ade",
        url: "settingupanodeenv.com",
        likes: 3
    },
    {
        title:"The impact of fiscal and monetary policies on the economy",
        author:"Paul Aderoju",
        url:"fiscal-econs.com",
        likes: 5,
    }
]

let token

const blogsInDb = async () => {
    const blogs = await Blog.find({})
    // console.log(blogs)
    return blogs.map(blog => blog.toJSON())
    }

before(async () => {
        await User.deleteMany({})
        token = await helper.generateToken()
})

// beforeEach(async () => {
//     await Blog.deleteMany({})
//     await User.deleteMany({})

//     const userPromises = initialUsers.map(async user => {
//         const passwordHash = await bcrypt.hash(user.password, 10)
//         const newUser = new User({ username: user.username, name: user.name, passwordHash })
//         return newUser.save()
//     })
//     const users = await Promise.all(userPromises)

//     const user = users[0]
//     const token = await helper.generateToken(user)

//     const blog = new Blog({
//         title: 'Test Blog',
//         author: user._id,
//         url: 'http://testblog.com',
//         likes: 0,
//         user: user._id
//     })
//     await blog.save()
// })

beforeEach(async () => {
    await Blog.deleteMany({})
    console.log('all blogs deleted')

    // const userPromises = helper.initialUsers.map(async user => {
    //     const passwordHash = await bcrypt.hash(user.password, 10)
    //     const newUser = new User({ username: user.username, name: user.name, passwordHash })
    //     return newUser.save()
    // })

    // const users = await Promise.all(userPromises)

    // const user = users[0]

    // const initialBlogs = [
    //     {
    //         title: "Setting up a node environment",
    //         author: "Paul Ade",
    //         url: "settingupanodeenv.com",
    //         likes: 3,
    //         user: user._id,
    //     },
    //     {
    //         title:"The impact of fiscal and monetary policies on the economy",
    //         author:"Paul Aderoju",
    //         url:"fiscal-econs.com",
    //         likes: 5,
    //         user: user._id,
    //     }
    // ]

    
    await Blog.insertMany(initialBlogs)
})

describe.only('Blog API tests', () => {
    test.only('the blog list application returns the correct amount of blog posts in JSON format', async () => {
        await api
            .get('/api/blogs ')
            .expect(200)
            .expect('Content-Type', /application\/json/)
    })
    
    test.only('the blog list application returns the correct amount of blog posts', async () => {
        const response = await api.get('/api/blogs')
        // console.log(response.body)
        assert.strictEqual(response.body.length, initialBlogs.length)
    })
    
    test.only('the unique identifier property of the blog posts is named id not _id', async () => {
        const response = await api.get('/api/blogs')
        const blogs = response.body
    
        blogs.forEach((blog) => {
            assert.strictEqual(blog.id !== undefined, true)
        })
    })
    
    test.only('post request to /api/blogs URL successfully creates a new blog post', async () => {
        
    
        const newBlog = {
            title: "Working up a react environment",
            author: "Peter Ade",
            url: "workingreactenv.com",
            likes: 5,
        }
    
        await api
            .post('/api/blogs')
            .set('Authorization', `Bearer ${token}`)
            .send(newBlog)
            .expect(201)
    
        const blogsAtEnd = await blogsInDb()
        
    
        assert.strictEqual(blogsAtEnd.length, initialBlogs.length + 1)
    })

    test.only('post request to /api/blogs URL fails with 401 Unauthorized if token is not provided', async () => {
        const blogToFail = {
            title: 'Failing Blog',
            author: 'Bruce Lewis',
            url: 'failingblog.io',
            likes: 1
        }

        await api
            .post('/api/blogs')
            .send(blogToFail)
            .expect(401)
    })
    
    test.only('missing likes property of a request defaults the value to 0', async () => {
        let newBlog = {
            title: 'No likes',
            author: 'Pius Char',
            url: 'asdfg.vom'
        }
    
        await api
            .post('/api/blogs')
            .set('Authorization', `Bearer ${token}`)
            .send(newBlog)
            .expect(201)
        
    
        const allBlogs = await blogsInDb()
    
        assert.strictEqual(allBlogs.at(-1).likes, 0)
    })
    
    test.only('missing blog title or url returns a 400 error', async () => {
        let noTitleBlog = {
            author: 'James Bond',
            url: "notitleblog.com"
        }
    
        await api
            .post('/api/blogs')
            .set('Authorization', `Bearer ${token}`)
            .send(noTitleBlog)
            .expect(400)
    
        let noUrlBlog = {
            title: "No URL Blog",
            author: 'Alex Great',
        }
    
        await api
            .post('/api/blogs')
            .set('Authorization', `Bearer ${token}`) 
            .send(noUrlBlog)
            .expect(400)
    
    })
    
    // test.only('deletion of a blog only if id is valid', async () => {
    //         const blogsAtStart = await blogsInDb()
    //         const blogToDelete = blogsAtStart[0]
    
    //         await api
    //             .delete(`/api/blogs/${blogToDelete.id}`)
    //             .set('Authorization', `Bearer ${token}`)
    //             .expect(204)
    
    //         const blogsAtEnd = await blogsInDb()
    //         assert.strictEqual(blogsAtEnd.length, initialBlogs.length - 1)
    // })
    test.only('deletion of a blog only if id is valid', async () => {
        const blogsAtStart = await blogsInDb()
        const blogToDelete = blogsAtStart[0]

        await api
            .delete(`/api/blogs/${blogToDelete.id}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(204)

        const blogsAtEnd = await blogsInDb()
        assert.strictEqual(blogsAtEnd.length, initialBlogs.length - 1)
    })
    
    test.only('updating a blog with a valid ID', async () => {
        const blogsAtStart = await blogsInDb()
        const blogToUpdate = blogsAtStart[0]
    
        const blog = { ...blogToUpdate, likes: 7 }
    
        await api
            .put(`/api/blogs/${blogToUpdate.id}`)
            .send(blog)
            .expect(200)
    
        const blogsAtEnd = await blogsInDb()
        const updatedBlog = blogsAtEnd[0]
    
        assert.strictEqual(updatedBlog.likes, 7)
    })
    
})

after(async () => {
    await mongoose.connection.close()
})