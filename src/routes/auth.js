const express = require("express")
const router = express.Router()
const _ = require("lodash")
const handler = require("../utilities/messagesHandler")
const validate = require("../middlewares/validate")
const authorize = require("../middlewares/authorize")
const sendMail = require("../utilities/sendMail")
const { User } = require("../../sequelize")

//Limit register, login, resetPassword & refresh endpoint
const rateLimit = require("express-rate-limit")
const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 6,
  message: {
    error:
      "Too many user registration attempt from this IP, please try again later."
  }
})
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 12,
  message: {
    error: "Too many login attempt from this IP, please try again later."
  }
})
const requestLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 4,
  message: {
    error:
      "Too many confirmation email or reset password request from this IP, please try again later."
  }
})

const refreshLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15,
  message: {
    error:
      "Too many refresh session attempt from this IP, please try again later."
  }
})

router.post(
  "/register",
  [registerLimiter, validate("register")],
  async (req, res) => {
    try {
      //perform request
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
      handler(res, "internalError", error)
    }
  }
)

router.post("/login", [loginLimiter, validate("login")], async (req, res) => {
  try {
    //🛂validate request
    const user = await User.findOne({ where: { username: req.body.username } })
    if (!user) {
      handler(res, "error", "Wrong username.")
      return
    }
    if ((await user.validPassword(req.body.password)) === false) {
      handler(res, "error", "Your password is invalid.")
      return
    }
    //✅perform request
    const token = await user.generateToken()
    handler(res, "success", { session: token, user: user.getProfile() })
  } catch (error) {
    handler(res, "internalError", error)
  }
})

router.post(
  "/auth/refresh",
  [refreshLimiter, validate("refresh"), authorize()],
  async (req, res) => {
    try {
      //🛂validate request
      const user = await User.findOne({
        where: { uuid: res.locals.user.uuid }
      })
      if (!user) {
        handler(
          res,
          "error",
          "User associated with your session doesn't exists anymore."
        )
        return
      }
      //✅perform request
      const token = await user.generateToken()
      handler(res, "success", token)
    } catch (error) {
      handler(res, "internalError", error)
    }
  }
)

router.post(
  "/auth/request/emailConfirmation",
  [requestLimiter, validate("requestEmailConfirmation")],
  async (req, res) => {
    try {
      //🛂validate request
      const user = await User.findOne({ where: { email: req.body.email } })
      if (!user) {
        //Send a success message even if no user exists to prevent user enumeration
        handler(
          res,
          "success",
          "If this email is associated with an account, a confirmation as been sent to it."
        )
        return
      }
      //✅perform request
      const token = await user.generateConfirmationToken()
      const updateUser = await User.update(
        {
          confirmationToken: token
        },
        { where: { uuid: user.uuid } }
      )
      const email = await sendMail("emailConfirmation", req.body.email, token)
      handler(
        res,
        "success",
        "If this email is associated with an account, a confirmation as been sent to it."
      )
    } catch (error) {
      handler(res, "internalError", error)
    }
  }
)

router.post(
  "/auth/request/resetPassword",
  [requestLimiter, validate("requestResetPassword")],
  async (req, res) => {
    try {
      //🛂validate request
      const user = await User.findOne({ where: { email: req.body.email } })
      if (!user) {
        //Send a success message even if no user exists to prevent user enumeration
        handler(
          res,
          "success",
          "If this email is associated with an account, a reset link as been sent to it."
        )
        return
      }
      //✅perform request
      const token = await user.generateConfirmationToken()
      const updateUser = await User.update(
        {
          resetPasswordToken: token
        },
        { where: { uuid: user.uuid } }
      )
      const email = await sendMail("resetPassword", req.body.email, token)
      handler(
        res,
        "success",
        "If this email is associated with an account, a reset as been sent to it."
      )
    } catch (error) {
      handler(res, "internalError", error)
    }
  }
)

router.post(
  "/auth/confirmEmail",
  validate("confirmEmail"),
  async (req, res) => {
    try {
      //🛂validate request
      const verifiedToken = User.verifyToken(req.body.token)
      if (!verifiedToken || verifiedToken.error) {
        handler(
          res,
          "error",
          "Your confirmation link as expired. Please login to request a new one."
        )
        return
      }

      const user = await User.findOne({
        where: { confirmationToken: req.body.token }
      })
      if (!user) {
        handler(
          res,
          "error",
          "Your confirmation link isn't associated to any account"
        )
        return
      }
      //✅perform request
      const updateUser = await User.update(
        {
          confirmationToken: null,
          confirmed: true
        },
        { where: { uuid: user.uuid } }
      )
      handler(res, "success", "Email successfully confirmed")
    } catch (error) {
      handler(res, "internalError", error)
    }
  }
)

router.post(
  "/auth/resetPassword",
  validate("resetPassword"),
  async (req, res) => {
    try {
      //🛂validate request
      const verifiedToken = User.verifyToken(req.body.token)
      if (!verifiedToken || verifiedToken.error) {
        handler(
          res,
          "error",
          "Your reset password link as expired. Please login to request a new one."
        )
        return
      }

      const user = await User.findOne({
        where: { resetPasswordToken: req.body.token }
      })
      if (!user) {
        handler(
          res,
          "error",
          "Your reset password link isn't associated to any account"
        )
        return
      }
      //✅perform request
      const hashedPassword = await User.hashPassword(req.body.password)
      const updateUser = await User.update(
        {
          resetPasswordToken: null,
          password: hashedPassword
        },
        { where: { uuid: user.uuid } }
      )
      handler(res, "success", "Password successfuly reset")
      
    } catch (error) {
      handler(res, "internalError", error + "sdf")
    }
  }
)

module.exports = router
