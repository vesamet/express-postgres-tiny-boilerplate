require("dotenv").config();

//Api--------------------
const express = require("express");
const app = express();
var bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
//Error Handling
const handler = require("./src/utilities/messagesHandler");
app.use(function errorHandler(err, req, res, next) {
  handler(res, "internalError", err.message);
});
//-----------------------

//Security---------------
const helmet = require("helmet");
app.use(helmet());
//-----------------------

//Monitoring-------------
// const auth = require("http-auth")
// const basic = auth.basic({ realm: "Monitor Area" }, function(
//   user,
//   pass,
//   callback
// ) {
//   callback(user === "dsgfdfg" && pass === "dfgsdg")
// })
// const statusMonitor = require("express-status-monitor")({ path: "" })
// app.use(statusMonitor.middleware)
// app.get("/status", auth.connect(basic), statusMonitor.pageRoute)
//-----------------------

//Routes-----------------
const fs = require("fs");
fs.readdir("./src/routes", (err, files) => {
  files.forEach(file => {
    app.use("/v1/", require("./src/routes/" + file));
  });
});
//-----------------------

app.use(function errorHandler(err, req, res, next) {
  res.status(500);
  res.render("errorEstis", { error: err });
});
//Enable api
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
