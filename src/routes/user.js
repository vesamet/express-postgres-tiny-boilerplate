const express = require("express")
const router = express.Router()
const _ = require("lodash")
const validate = require("../middlewares/validate")
let handler = require("../utilities/messagesHandler")
const { User } = require("../../sequelize")

//restrict routes to logged user
var authorize = require("../middlewares/authorize")
router.use(authorize())

router.get("/user/profile", async (req, res) => {
  try {
    const profile = await res.locals.user.getProfile()
    handler(res, "success", profile)
  } catch (error) {
    handler(res, "internalError", error)
  }
})

router.post(
  "/user/changePassword",
  validate("changePassword"),
  async (req, res) => {
    try {
      //✅perform request
      const hashedPassword = await User.hashPassword(req.body.password)
      const uuid = await res.locals.user.uuid
      const updatedUser = User.update(
        {
          password: hashedPassword
        },
        { where: { uuid: uuid } }
      )
      handler(res, "success", "Password successfuly changed")
    } catch (error) {
      console.log(error)
      handler(res, "internalError", error + "dsfg")
    }
  }
)

module.exports = router
