const Joi = require("@hapi/joi");

const uuid = Joi.string()
  .guid({
    version: ["uuidv4"]
  })
  .required();
const session = (token = Joi.string()
  .required()
  .max(2000));
//------------------
//VALIDATION SCHEMAS
//------------------
const schemas = {
  //General
  //Auth
  login: Joi.object().keys({
    username: Joi.string()
      .required()
      .min(3)
      .max(60)
      .trim(),
    password: Joi.string()
      .required()
      .min(8)
      .max(300)
  }),
  register: Joi.object().keys({
    username: Joi.string()
      .required()
      .min(3)
      .max(60)
      .trim(),
    password: Joi.string()
      .required()
      .min(8)
      .max(300),
    email: Joi.string()
      .email()
      .required()
      .trim()
  }),
  refresh: Joi.object().keys({
    session: session
  }),
  requestEmailConfirmation: Joi.object().keys({
    email: Joi.string()
      .email()
      .required()
      .trim()
  }),
  requestResetPassword: Joi.object().keys({
    email: Joi.string()
      .email()
      .required()
      .trim()
  }),
  confirmEmail: Joi.object().keys({
    token: token
  }),
  resetPassword: Joi.object().keys({
    token: token,
    password: Joi.string()
      .required()
      .min(8)
      .max(300)
  }),
  //User
  changePassword: Joi.object().keys({
    password: Joi.string()
      .required()
      .min(8)
      .max(300)
  })

  // define all the other schemas below
};

module.exports = schemas;
