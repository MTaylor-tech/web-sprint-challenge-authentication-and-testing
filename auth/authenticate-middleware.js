/*
  complete the middleware code to check if the user is logged in
  before granting access to the next middleware/route handler
*/

const jwt = require("jsonwebtoken")

module.exports = (req, res, next) => {
  const authError = {
    message: "Not authorized",
  }

  try {

    if (!req.headers || !req.headers.authorization) {
      return res.status(401).json(authError)
    }

    const token = req.headers.authorization.split(";")[0].split("=")[1]

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json(authError)
      }

      next()
    })
  } catch(err) {
    next(err)
  }
};
