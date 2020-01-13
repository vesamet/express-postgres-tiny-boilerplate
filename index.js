require("dotenv").config()

//Api--------------------
const express = require("express")
var bodyParser = require("body-parser")
const app = express()
app.use(bodyParser.json())
//-----------------------

//Security---------------
const helmet = require("helmet")
app.use(helmet())
//-----------------------

//Monitoring-------------
const auth = require("http-auth")
const basic = auth.basic({ realm: "Monitor Area" }, function(
  user,
  pass,
  callback
) {
  callback(user === "username" && pass === "password")
})
const statusMonitor = require("express-status-monitor")({ path: "" })
app.use(statusMonitor.middleware)
app.get("/status", auth.connect(basic), statusMonitor.pageRoute)
//-----------------------

//Routes-----------------
const fs = require("fs")
fs.readdir("./src/routes", (err, files) => {
  files.forEach(file => {
    app.use("/", require("./src/routes/" + file))
  })
})
//-----------------------

//Enable api
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`)
})
