const blogsRouter  = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')

// const getTokenFrom = request => {
//     const authorization = request.get('authorization')
//     if (authorization && authorization.startsWith('Bearer ')) {
//         return authorization.replace('Bearer ', '')
//     }
//     return null
// }

//  Get all blogs
blogsRouter.get('/', async (request, response) => {
    const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 })
    response.json(blogs)
        
})

// Create a new blog
blogsRouter.post('/', async (request, response) => {
    
    const body = request.body
    // console.log('request', request) 

    const decodedToken = jwt.verify(request.token, process.env.SECRET)
    if (!decodedToken.id) {
        return response.status(401).json({ error: 'token invalid' })
    }

    const user = await User.findById(decodedToken.id)

    // const users = await User.find({})
    // if (users.length === 0) {
    //     return response.status(400).send({ error: 'No users found in the database' })
    // }

    // const firstUser = users[0]

    const blog = new Blog({
        title: body.title,
        author: body.author,
        url: body.url,
        likes: body.likes || 0,
        user: user.id,
    })

    if (!blog.title) {
        return response.status(400).send({ error: `missing title`})
    }

    if(!blog.url) {
        return response.status(400).send({ error: `missing url`})
    }

    const savedBlog = await blog.save()
    user.blogs = user.blogs.concat(savedBlog._id)
    await user.save()

    response.status(201).json(savedBlog)
})

// Update a blog
blogsRouter.put(`/:id`, async (request, response) => {
    const body = request.body

    const blog = {
        title: body.title,
        author: body.author,
        url: body.url,
        likes: body.likes || 0
    }

    const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, { new: true })
    response.json(updatedBlog)

})

// Delete a blog
blogsRouter.delete(`/:id`, async (request, response) => {
    const id = request.params.id
    await Blog.findByIdAndDelete(id)
    response.status(204).end()
})
module.exports = blogsRouter