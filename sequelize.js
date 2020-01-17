const Sequelize = require("sequelize");
const UserModel = require("./src/models/user.model");

const sequelize = new Sequelize(process.env.DEV_DATABASE, {
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

//Import models
const User = UserModel(sequelize, Sequelize);

//Init/Update database
async function init() {
  await sequelize.sync({ force: true } /* Disable in production */);
  console.log(`
  =========================================
  Database & tables created and updated!
  =========================================
  `);
}
init();

module.exports = {
  User
};
