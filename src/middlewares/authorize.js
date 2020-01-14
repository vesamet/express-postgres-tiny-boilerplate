let handler = require("../utilities/messagesHandler")
const { User } = require("../../sequelize")
module.exports = function() {
  return async function(req, res, next) {
    try {
      res.locals.user = undefined
      //check if token is valid
      const token = req.body.session || req.query.session || undefined
      const verifiedToken = User.verifyToken(token)
      if (!verifiedToken || verifiedToken.error) {
        //Token is invalid
        handler(
          res,
          "error",
          "Oh, your session has expired. Please refresh the page."
        )
      } else {
        //Token is valid

        //Refresh token if required

        //Retrieve user associated with the token
        const user = await User.findOne({ where: { uuid: verifiedToken.uuid } })
        if (!user) {
          handler(
            res,
            "error",
            "The user associated with your session doesn't exists. Please refresh the page."
          )
        }
        //Save the user profile locally for
        res.locals.user = user.getProfile()
        next()
      }
    } catch (error) {
      handler(res, "internalError", error)
    }
    next()
  }
}
