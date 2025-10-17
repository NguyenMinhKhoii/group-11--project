const jwt = require("jsonwebtoken");
require("dotenv").config();

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ 
      message: "Access Token required!",
      error: "NO_TOKEN" 
    });
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET || "accesssecret", (err, user) => {
    if (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({ 
          message: "Access Token expired!", 
          error: "TOKEN_EXPIRED" 
        });
      }
      return res.status(403).json({ 
        message: "Access Token invalid!",
        error: "TOKEN_INVALID" 
      });
    }
    req.user = user;
    next();
  });
}

module.exports = { authenticateToken };
