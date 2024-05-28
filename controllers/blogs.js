const blogsRouter  = require('express').Router()
const { response } = require('express')
const Blog = require('../models/blog')

//  Get all blogs
blogsRouter.get('/', async (request, response) => {
    const blogs = await Blog.find({})
    response.json(blogs)
        
})

// Create a new blog
blogsRouter.post('/', async (request, response) => {
    const body = request.body 

    const blog = new Blog({
        title: body.title,
        author: body.author,
        url: body.url,
        likes: body.likes || 0
    })

    if (!blog.title) {
        return response.status(400).send({ error: `missing title`})
    }

    if(!blog.url) {
        return response.status(400).send({ error: `missing url`})
    }

  
    const savedBlog = await blog.save()
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