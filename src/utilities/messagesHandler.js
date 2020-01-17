const _ = require("lodash");
function messagesHandler(res, type, value) {
  //check if error is a sequelize error
  if (_.has(value, "errors[0].message")) {
    value = value.errors[0].message;
    type = "error";
  }
  //Otherwise, send error message accordingly
  switch (type) {
    case "error":
      return res.status(400).json({ error: value });
      break;
    case "internalError":
      if (process.env.NODE_ENV !== "production") {
        return res.status(500).json({ error: value });
      } else {
        return res
          .status(500)
          .json({ error: "Sorry, An internal error occured." });
      }
      break;
    case "success":
      return res.json({ success: value });
      break;
    default:
      return res.json({ error: value });
  }
}

module.exports = messagesHandler;
