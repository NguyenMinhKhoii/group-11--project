const jwt = require("jsonwebtoken");
require("dotenv").config();

function generateAccessToken(user) {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET || "accesssecret", { expiresIn: "15m" }); // 15 phút
}

function generateRefreshToken(user) {
  return jwt.sign(user, process.env.REFRESH_TOKEN_SECRET || "refreshsecret", { expiresIn: "7d" }); // 7 ngày
}

function verifyRefreshToken(token) {
  return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET || "refreshsecret");
}

module.exports = { generateAccessToken, generateRefreshToken, verifyRefreshToken };
