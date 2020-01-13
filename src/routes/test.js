var express = require('express');
var router = express.Router();
const { User, Blog, Tag } = require('../../sequelize')
// //Middle ware that is specific to this router
// router.use(function timeLog(req, res, next) {
//   console.log('Time: ', Date.now());
//   next();
// });


// Define the home page route
router.get('/', function(req, res) {
  res.send('home page');
});

// create a user
router.post('/api/users', (req, res) => {
    User.create(req.body)
        .then(user => res.json(user))
})
// get all users
router.get('/api/users', (req, res) => {
    User.findAll().then(users => res.json(users))
})
// create a blog post
router.post('/api/blogs', (req, res) => {
    const body = req.body
    // either find a tag with name or create a new one
    const tags = body.tags.map(tag => Tag.findOrCreate({ where: { name: tag.name }, defaults: { name: tag.name }})
                                         .spread((tag, created) => tag))
    User.findById(body.userId)
        .then(() => Blog.create(body))
        .then(blog => Promise.all(tags).then(storedTags => blog.addTags(storedTags)).then(() => blog))
        .then(blog => Blog.findOne({ where: {id: blog.id}, include: [User, Tag]}))
        .then(blogWithAssociations => res.json(blogWithAssociations))
        .catch(err => res.status(400).json({ err: `User with id = [${body.userId}] doesn\'t exist.`}))
})

// find blogs belonging to one user or all blogs
router.get('/api/blogs/:userId?', (req, res) => {
    let query;
    if(req.params.userId) {
        query = Blog.findAll({ include: [
            { model: User, where: { id: req.params.userId } },
            { model: Tag }
        ]})
    } else {
        query = Blog.findAll({ include: [Tag, User]})
    }
    return query.then(blogs => res.json(blogs))
})

module.exports = router;