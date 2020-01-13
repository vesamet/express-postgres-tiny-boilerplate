const Sequelize = require("sequelize")
const datatypes = {
  uuid: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
    validate: {
      isUUID: 4
    }
  }
}

module.exports = datatypes
