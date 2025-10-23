// Simple MongoDB Atlas Connection Test
const mongoose = require("mongoose");

// Production connection string
const mongoUri =
  "mongodb+srv://anhbuinhatt_db_user:nhom11@cluster0.ve0bn28.mongodb.net/groupDB_production?retryWrites=true&w=majority&appName=Cluster0";

console.log("🧪 Testing MongoDB Atlas Connection...");
console.log("Connecting to production database...");

mongoose
  .connect(mongoUri)
  .then(() => {
    console.log("✅ MongoDB Atlas connected successfully!");
    console.log("📊 Database:", mongoose.connection.name);
    console.log("🔗 Host:", mongoose.connection.host);
    return mongoose.connection.close();
  })
  .then(() => {
    console.log("🔐 Connection closed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Connection failed:", error.message);
    process.exit(1);
  });
