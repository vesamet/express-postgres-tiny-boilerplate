const Sequelize = require('sequelize')
const UserModel = require('./src/models/user')
const BlogModel = require('./src/models/blog')
const TagModel = require('./src/models/tag')

const sequelize = new Sequelize(process.env.DEV_DATABASE, {
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
})

const User = UserModel(sequelize, Sequelize)
// BlogTag will be our way of tracking relationship between Blog and Tag models
// each Blog can have multiple tags and each Tag can have multiple blogs
const BlogTag = sequelize.define('blog_tag', {})
const Blog = BlogModel(sequelize, Sequelize)
const Tag = TagModel(sequelize, Sequelize)

Blog.belongsToMany(Tag, { through: BlogTag, unique: false })
Tag.belongsToMany(Blog, { through: BlogTag, unique: false })
Blog.belongsTo(User);

sequelize.sync({ force: true } /* Disable in production */)
  .then(() => {
    console.log(`Database & tables created and/or updated!`)
  })

module.exports = {
  User,
  Blog,
  Tag
}