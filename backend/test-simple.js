const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

console.log("Testing simple server...");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 5174;
app.listen(PORT, () => {
  console.log(`Simple test server running on http://localhost:${PORT}`);
});