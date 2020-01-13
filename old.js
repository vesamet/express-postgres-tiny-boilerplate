require("dotenv").config()

const { Sequelize, Model, DataTypes } = require("sequelize")
const sequelize = new Sequelize(process.env.DEV_DATABASE, {
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
})
const User = require("./src/models/user.model")
// const uuid = {
//     type: Sequelize.UUID,
//     defaultValue: Sequelize.UUIDV1,
//     primaryKey: true
//   }

// class User extends Model {}
// User.init({
//   // attributes
//   uuid,
//   firstName: {
//     type: Sequelize.STRING,
//     allowNull: false
//   },
//   lastName: {
//     type: Sequelize.STRING
//     // allowNull defaults to true
//   }
// }, {
//   sequelize,
//   modelName: 'user'
//   // options
// });
sequelize
  .drop() // create the database table for our model(s)
  .then(function() {
    User.sync()
  })
  .then(() =>
    User.create({
      firstName: "jane",
      lastName: "doe"
    })
  )
  .then(jane => {
    console.log(jane.toJSON())
  })

const express = require("express")
const app = express()

//Security---------------
const helmet = require("helmet")
app.use(helmet())
//-----------------------

//Monitoring-------------
const auth = require("http-auth")
const basic = auth.basic({ realm: "Monitor Area" }, function(
  user,
  pass,
  callback
) {
  callback(user === "username" && pass === "password")
})
const statusMonitor = require("express-status-monitor")({ path: "" })
app.use(statusMonitor.middleware)
app.get("/status", auth.connect(basic), statusMonitor.pageRoute)
//-----------------------

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`)
})
