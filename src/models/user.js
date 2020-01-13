const datatypes = require("../utilities/datatypes")
module.exports = (sequelize, Sequelize) => {
  return sequelize.define(
    "user",
    {
      uuid: datatypes.uuid,
      firstname: Sequelize.STRING,
      lastname: Sequelize.STRING,
    },
    {
      //options
      paranoid: true,
      getterMethods: {
        fullName() {
          return this.firstname + " " + this.lastname
        }
      },
      validate: {
        fullNameOrNone() {
          if ((this.firstname === null) !== (this.lastname === null)) {
            throw new Error('Require either firstname  and lastname or neither')
          }
        }
      }
    }
  )
}
