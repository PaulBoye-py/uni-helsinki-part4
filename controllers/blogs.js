const blogsRouter  = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')
const middleware = require('../utils/middleware')

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
blogsRouter.post('/', middleware.userExtractor, async (request, response) => {
    
    const body = request.body

    const user = request.user

    if (!user) {
        return response.status(401).json({ error: 'token missing or invalid'})
    }

    const blog = new Blog({
        title: body.title,
        author: body.author,
        url: body.url,
        likes: body.likes || 0,
        user: user._id,
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
blogsRouter.delete(`/:id`, middleware.userExtractor, async (request, response) => {

    const user = request.user

    if (!user) {
        return response.status(401).json({ error: 'token missing or invalid' })
    }

    // verify that the user is signed in before deleting a note
    const decodedToken = jwt.verify(request.token, process.env.SECRET)
    if (!decodedToken.id) {
        return response.status(401).json({ error: 'token invalid' })
    }
    console.log('decoded user', decodedToken.id)

    const blogtoDelete = await Blog.findById(request.params.id)

    if (!blogtoDelete) {
        return response.status(404).json({ error: 'blog not found' })
    }

    console.log(blogtoDelete)


    if (blogtoDelete.user.toString() === decodedToken.id) {
        await Blog.findByIdAndDelete(request.params.id)
        response.status(204).end()
    } else {
        response.status(403).json({ error: 'this user is not authorized to delete this blog' })
    }

    
    
})

module.exports = blogsRouter