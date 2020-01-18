require("dotenv").config()

//Api--------------------
const express = require("express")
const app = express()
app.set("trust proxy", 1)
var bodyParser = require("body-parser")
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
//Error Handling
const handler = require("./src/utilities/messagesHandler")
app.use(async function errorHandler(err, req, res, next) {
  try {
    handler(res, "internalError", err.message)
  } catch (error) {
    handler(res, "internalError", error)
  }
})
//-----------------------

//Security---------------
const helmet = require("helmet")
app.use(helmet())
const slowDown = require("express-slow-down")
const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 1 minutes
  delayAfter: 40, // allow 100 requests per 15 minutes, then...
  delayMs: 500 // begin adding 500ms of delay per request above 100:
})
app.use(speedLimiter)
//-----------------------

//Monitoring-------------
// const auth = require("http-auth")
// const basic = auth.basic({ realm: "Monitor Area" }, function(
//   user,
//   pass,
//   callback
// ) {
//   callback(user === process.env.MONITORING_USERNAME && pass === process.env.MONITORING_PASSWORD)
// })
// const statusMonitor = require("express-status-monitor")({ path: "" })
// app.use(statusMonitor.middleware)
// app.get("/status", auth.connect(basic), statusMonitor.pageRoute)
//-----------------------

//Routes-----------------
const fs = require("fs")
fs.readdir("./src/routes", (err, files) => {
  files.forEach(file => {
    app.use("/v1/", require("./src/routes/" + file))
  })
})
//-----------------------

app.use(function errorHandler(err, req, res, next) {
  res.status(500)
  res.render("errorEstis", { error: err })
})
//Enable api
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`)
})
