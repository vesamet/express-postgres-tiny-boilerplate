const Sequelize = require("sequelize")
const UserModel = require("./src/models/user.model")

const sequelize = new Sequelize(process.env.DEV_DATABASE, {
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
})

//Import models
const User = UserModel(sequelize, Sequelize)

//Init/Update database
async function init() {
  await sequelize.sync({ force: true } /* Disable in production */)
  console.log(`
  =========================================
  Database & tables created and updated!
  =========================================
  `)
}
init()

//Graceful Exits---------
process.stdin.resume()
function exitHandler(options, exitCode) {
  if (options.cleanup) sequelize.close()
  if (exitCode || exitCode === 0) console.log(exitCode)
  if (options.exit) process.exit()
}
process.on("exit", exitHandler.bind(null, { cleanup: true }))
process.on("SIGINT", exitHandler.bind(null, { exit: true }))
process.on("SIGUSR1", exitHandler.bind(null, { exit: true }))
process.on("SIGUSR2", exitHandler.bind(null, { exit: true }))
//-----------------------

module.exports = {
  User
}
