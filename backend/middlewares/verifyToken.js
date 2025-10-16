const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config(); // quan trọng!

const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.error("JWT verify error:", err.message); // thêm log để xem lỗi thật
    return res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = verifyToken;
