function messagesHandler(res, type, value) {
  switch (type) {
    case "error":
      return res.status(400).json({ error: value })
      break
    case "internalError":
      if (process.env.NODE_ENV !== "production") {
        return res.status(500).json({ error: value })
      } else {
        return res
          .status(500)
          .json({ error: "Sorry, An internal error occured." })
      }
      break
    case "success":
      return res.json({ success: value })
      break
    default:
      return res.json({ success: value })
  }
}

module.exports = messagesHandler
