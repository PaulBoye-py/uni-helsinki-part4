const blogsRouter  = require('express').Router()
const { response } = require('express')
const Blog = require('../models/blog')

//  Get all blogs
blogsRouter.get('/', (request, response) => {
    Blog  
        .find({})
        .then(blogs => {
            response.json(blogs)
        })
})

// Create a new blog
blogsRouter.post('/', (request, response) => {
    const blog = new Blog(request.body)

    blog
        .save()
        .then(savedBlog => {
            response.status(201).json(savedBlog)
        })
})

module.exports = blogsRouter