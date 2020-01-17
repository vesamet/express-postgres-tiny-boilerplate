const express = require("express");
const router = express.Router();
const _ = require("lodash");
const handler = require("../utilities/messagesHandler");
const validate = require("../middlewares/validate");
const authorize = require("../middlewares/authorize");
const sendMail = require("../utilities/sendMail");
const { User } = require("../../sequelize");

router.post("/register", validate("register"), async (req, res) => {
  try {
    //perform request
    //create User
    const user = await User.create(req.body);
    //send confirmation email
    const token = await user.generateConfirmationToken();
    const updateUser = await User.update(
      {
        confirmationToken: token
      },
      { where: { uuid: user.uuid } }
    );
    //const email = await sendMail("emailConfirmation", req.body.email, token);
    handler(res, "success", "Registration successfull");
  } catch (error) {
    handler(res, "internalError", error);
  }
});

router.post("/login", validate("login"), async (req, res) => {
  try {
    //🛂validate request
    const user = await User.findOne({ where: { username: req.body.username } });
    if (!user) {
      handler(res, "error", "Wrong username.");
      return;
    }
    if ((await user.validPassword(req.body.password)) === false) {
      handler(res, "error", "Your password is invalid.");
      return;
    }
    //✅perform request
    const token = await user.generateToken();
    handler(res, "success", { session: token, user: user.getProfile() });
  } catch (error) {
    handler(res, "internalError", error);
  }
});

router.post(
  "/auth/refresh",
  [validate("refresh"), authorize()],
  async (req, res) => {
    try {
      //🛂validate request
      const user = await User.findOne({
        where: { uuid: res.locals.user.uuid }
      });
      if (!user) {
        handler(
          res,
          "error",
          "User associated with your session doesn't exists anymore."
        );
        return;
      }
      //✅perform request
      const token = await user.generateToken();
      handler(res, "success", token);
    } catch (error) {
      handler(res, "internalError", error);
    }
  }
);

router.post(
  "/auth/request/emailConfirmation",
  validate("requestEmailConfirmation"),
  async (req, res) => {
    try {
      //🛂validate request
      const user = await User.findOne({ where: { email: req.body.email } });
      if (!user) {
        //Send a success message even if no user exists to prevent user enumeration
        handler(
          res,
          "success",
          "If this email is associated with an account, a confirmation as been sent to it."
        );
        return;
      }
      //✅perform request
      const token = await user.generateConfirmationToken();
      const updateUser = await User.update(
        {
          confirmationToken: token
        },
        { where: { uuid: user.uuid } }
      );
      const email = await sendMail("emailConfirmation", req.body.email, token);
      handler(
        res,
        "success",
        "If this email is associated with an account, a confirmation as been sent to it."
      );
    } catch (error) {
      handler(res, "internalError", error);
    }
  }
);

router.post(
  "/auth/request/resetPassword",
  validate("requestResetPassword"),
  async (req, res) => {
    try {
      //🛂validate request
      const user = await User.findOne({ where: { email: req.body.email } });
      if (!user) {
        //Send a success message even if no user exists to prevent user enumeration
        handler(
          res,
          "success",
          "If this email is associated with an account, a reset link as been sent to it."
        );
        return;
      }
      //✅perform request
      const token = await user.generateConfirmationToken();
      const updateUser = await User.update(
        {
          resetPasswordToken: token
        },
        { where: { uuid: user.uuid } }
      );
      const email = await sendMail("resetPassword", req.body.email, token);
      handler(
        res,
        "success",
        "If this email is associated with an account, a reset as been sent to it."
      );
    } catch (error) {
      handler(res, "internalError", error);
    }
  }
);

router.post(
  "/auth/confirmEmail",
  validate("confirmEmail"),
  async (req, res) => {
    try {
      //🛂validate request
      const verifiedToken = User.verifyToken(req.body.token);
      if (!verifiedToken || verifiedToken.error) {
        handler(
          res,
          "error",
          "Your confirmation link as expired. Please login to request a new one."
        );
        return;
      }

      const user = await User.findOne({
        where: { confirmationToken: req.body.token }
      });
      if (!user) {
        //Send a success message even if no user exists to prevent user enumeration
        handler(
          res,
          "error",
          "Your confirmation link isn't associated to any account"
        );
        return;
      }
      //✅perform request
      const updateUser = await User.update(
        {
          confirmationToken: null,
          confirmed: true
        },
        { where: { uuid: user.uuid } }
      );
      handler(res, "success", "Email successfully confirmed");
    } catch (error) {
      handler(res, "internalError", error);
    }
  }
);

module.exports = router;
