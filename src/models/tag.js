const datatypes = require('../utilities/datatypes')
module.exports = (sequelize, Sequelize) => {
    return sequelize.define('tag', {
        uuid: datatypes.uuid,
        name: Sequelize.STRING
    })
}