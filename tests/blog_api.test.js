const { test, after, beforeEach } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const Blog = require('../models/blog')
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

const blogsInDb = async () => {
    const blogs = await Blog.find({})
    // console.log(blogs)
    return blogs.map(blog => blog.toJSON())
    }



beforeEach(async () => {
    await Blog.deleteMany({})
    console.log('all blogs deleted')
    
    await Blog.insertMany(initialBlogs)
})

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
        likes: 5 
    }

    await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(201)

    const blogsAtEnd = await blogsInDb()
    

    assert.strictEqual(blogsAtEnd.length, initialBlogs.length + 1)
})

test.only('missing likes property of a request defaults the value to 0', async () => {
    let newBlog = {
        title: 'No likes',
        author: 'Pius Char',
        url: 'asdfg.vom'
    }

    await api
        .post('/api/blogs')
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
        .send(noTitleBlog)
        .expect(400)

    let noUrlBlog = {
        title: "No URL Blog",
        author: 'Alex Great',
    }

    await api
        .post('/api/blogs')
        .send(noUrlBlog)
        .expect(400)

})

after(async () => {
    await mongoose.connection.close()
})