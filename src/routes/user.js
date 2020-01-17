const express = require("express");
const router = express.Router();
const _ = require("lodash");
let handler = require("../utilities/messagesHandler");
const { User } = require("../../sequelize");

//restric routes to logged user
var authorize = require("../middlewares/authorize");
router.use(authorize());

router.get("/user/profile", function(req, res) {
  handler(res, "success", res.locals.user);
});

module.exports = router;
