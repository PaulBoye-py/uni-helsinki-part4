const dummy = (blogs) => {
    return 1
}

const totalLikes = (blogs) => {
    return blogs.reduce((sum, blog) => sum + (blog.likes || 0), 0);
}

const favoriteBlog = (blogs) => {
    const favorite = blogs.reduce((prev, current) => {
        return (prev.likes > current.likes) ? prev : current;
    });

    return {
        title: favorite.title,
        author: favorite.author,
        likes: favorite.likes
    };
}

const mostBlogs = (blogs) => {
    const authorCount = blogs.reduce((acc, blog) => {
        acc[blog.author] = (acc[blog.author] || 0) + 1;
        return acc;
    }, {})

    const mostAuthored = Object.keys(authorCount).reduce((a, b) => {
        return authorCount[a] > authorCount[b] ? a : b;
    });

    return {
        author: mostAuthored,
        blogs: authorCount[mostAuthored]
    };
}

const mostLikes = (blogs) => {
    const authorLikes = blogs.reduce((acc, curr) => {
        if (acc[curr.author]) {
            acc[curr.author] += curr.likes
        } else {
            acc[curr.author] = curr.likes
        }
        // console.log(acc)
        return acc
}, {})

    const mostLikedAuthor = Object.keys(authorLikes).reduce((a, b) => {
        return authorLikes[a] > authorLikes[b] ?
            a : b
    })

    return {
        author: mostLikedAuthor,
        likes: authorLikes[mostLikedAuthor]
    }
}

module.exports = {
    dummy,
    totalLikes,
    favoriteBlog,
    mostBlogs,
    mostLikes
}