const express = require("express");
const app = express();
const userRoutes = require("./routes/user");

app.use(express.json()); // ✅ Cho phép đọc JSON từ body
app.use("/", userRoutes); // hoặc app.use("/api", userRoutes)

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
