const express = require("express")
const router = express.Router()
const _ = require("lodash")
var handler = require("../utilities/messagesHandler")
const validate = require("../middlewares/validate")
const authorize = require("../middlewares/authorize")
var sendMail = require("../utilities/sendMail")
const { User } = require("../../sequelize")

router.post("/register", validate("register"), async (req, res) => {
  try {
    //create User
    const user = await User.create(req.body)
    //send confirmation email
    const token = await user.generateConfirmationToken()
    const updateUser = await User.update(
      {
        confirmationToken: token
      },
      { where: { uuid: user.uuid } }
    )
    const email = await sendMail("emailConfirmation", req.body.email, token)
    handler(res, "success", "Registration successfull")
  } catch (error) {
    if (error.errors[0].message) {
      //Sequelize error message
      handler(res, "error", error.errors[0].message)
    } else {
      handler(res, "internalError", error)
    }
  }
})

router.post("/login", validate("login"), async (req, res) => {
  try {
    const user = await User.findOne({ where: { username: req.body.username } })

    if (!user) {
      handler(res, "error", "Wrong username.")
    } else if ((await user.validPassword(req.body.password)) === false) {
      handler(res, "error", "Your password is invalid.")
    } else {
      const token = await user.generateToken()
      handler(res, "success", token)
    }
  } catch (error) {
    handler(res, "internalError", error)
  }
})

router.post(
  "/auth/refresh",
  [validate("refresh"), authorize()],
  async (req, res) => {
    try {
      const user = await User.findOne({ where: { uuid: res.locals.user.uuid } })

      if (!user) {
        handler(
          res,
          "error",
          "User associated with your session doesn't exists anymore."
        )
      } else {
        const token = await user.generateToken()
        handler(res, "success", token)
      }
    } catch (error) {
      handler(res, "internalError", error)
    }
  }
)

router.post(
  "/auth/request/emailConfirmation",
  validate("requestEmailConfirmation"),
  async (req, res) => {
    try {
      const user = await User.findOne({ where: { email: req.body.email } })

      if (!user) {
        //Send a success message even if no user exists to prevent user enumeration
        handler(
          res,
          "success",
          "If your email is associated with an account, a message as been sent to it."
        )
      } else {
        const token = await user.generateConfirmationToken()
        const updateUser = await User.update(
          {
            confirmationToken: token
          },
          { where: { uuid: user.uuid } }
        )
        const email = await sendMail("emailConfirmation", req.body.email, token)
        handler(res, "success", "Confirmation Email sent")
      }
    } catch (error) {
      handler(res, "internalError", error + "sdf")
    }
  }
)

router.post(
  "/auth/confirmEmail",
  validate("confirmEmail"),
  async (req, res) => {
    try {
      const verifiedToken = User.verifyToken(req.body.confirmEmailToken)
      if (!verifiedToken || verifiedToken.error) {
        handler(
          res,
          "error",
          "Your confirmation link as expired. Please login to request a new one."
        )
      }
      const user = await User.findOne({
        where: { confirmationToken: req.body.confirmEmailToken }
      })
      if (!user) {
        //Send a success message even if no user exists to prevent user enumeration
        handler(
          res,
          "error",
          "Your confirmation link isn't associated to any account"
        )
      } else {
        const updateUser = await User.update(
          {
            confirmationToken: null
          },
          { where: { uuid: user.uuid } }
        )
        handler(res, "success", "Email successfully confirmed")
      }
    } catch (error) {
      handler(res, "internalError", error + "sdf")
    }
  }
)

module.exports = router
