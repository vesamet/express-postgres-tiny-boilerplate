const sharedTypes = require("../utilities/sharedTypes")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const _ = require("lodash")
module.exports = (sequelize, dataTypes) => {
  const User = sequelize.define(
    "user",
    {
      uuid: sharedTypes.uuid,
      username: {
        type: dataTypes.STRING,
        allowNull: false,
        unique: true
      },
      email: {
        type: dataTypes.STRING,
        allowNull: false,
        unique: true
      },
      password: {
        type: dataTypes.STRING,
        allowNull: false
      },
      confirmationToken: {
        type: dataTypes.STRING,
        allowNull: true
      },
      confirmed: {
        type: dataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false
      },
      resetPasswordToken: {
        type: dataTypes.STRING,
        allowNull: true
      }
    },
    {
      //options
      paranoid: true,
      hooks: {
        beforeCreate: async function(user) {
          user.password = await bcrypt.hash(user.password, process.env.PW_SALT)
        }
      }
    }
  )
  //Instance methods
  User.prototype.validPassword = async function(password) {
    return await bcrypt.compareSync(password, this.password)
  }
  ;(User.prototype.generateToken = function() {
    return jwt.sign({ uuid: this.uuid }, process.env.JWT_SALT, {
      expiresIn: "15m"
    })
  }),
    (User.prototype.generateConfirmationToken = function() {
      return jwt.sign({ uuid: this.uuid }, process.env.JWT_SALT, {
        expiresIn: "1d"
      })
    })
  User.prototype.getProfile = function() {
    const profile = this
    profile.uuid = profile.password = profile.confirmationToken = profile.resetPasswordToken = undefined
    return profile
  }

  //Class methods
  User.verifyToken = function(token) {
    try {
      let tokenPayload = jwt.verify(token, process.env.JWT_SALT)
      return tokenPayload
    } catch (error) {
      return { error: error }
    }
  }
  User.hashPassword = async function(password) {
    return await bcrypt.hash(password, process.env.PW_SALT)
  }

  return User
}
