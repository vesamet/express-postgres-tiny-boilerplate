const datatypes = require('../utilities/datatypes')
module.exports = (sequelize, Sequelize) => {
    return sequelize.define('blog', {
        uuid: datatypes.uuid,
        text: Sequelize.STRING
    })
}