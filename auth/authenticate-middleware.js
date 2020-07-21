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

    let token

    if ((!req.headers || !req.headers.authorization) && !req.cookies) {
      return res.status(401).json(authError)
    }

    if (req.cookies && req.cookies.token) {
      token = req.cookies.token
    } else {

      if (req.headers.authorization.includes(";")) {
        token = req.headers.authorization.split(";")[0].split("=")[1]
      } else {
        token = req.headers.authorization.split(" ")[1]
      }
      console.log(`Authorization: ${req.headers.authorization}`)
    }
    
    console.log(`Token: ${token}`)


    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      console.log(decoded)
      if (err) {
        return res.status(401).json(authError)
      } else {
        req.userId = decoded.userId
        req.username = decoded.username
      }

      next()
    })
  } catch(err) {
    next(err)
  }
};
