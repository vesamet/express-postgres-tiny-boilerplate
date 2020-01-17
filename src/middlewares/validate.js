let handler = require("../utilities/messagesHandler");
const schemas = require("../utilities/schemas");

const middleware = schema => {
  return (req, res, next) => {
    //Validate body with schema
    const { error } = schemas[schema].validate(req.body);
    const valid = error == null;

    if (valid) {
      next();
    } else {
      const { details } = error;
      const message = details.map(i => i.message).join(",");
      handler(res, "error", message);
    }
  };
};
module.exports = middleware;
