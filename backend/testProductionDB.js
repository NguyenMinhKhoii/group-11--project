// Test Production MongoDB Atlas Connection
const mongoose = require("mongoose");
const dotenv = require("dotenv");

// Load production environment
dotenv.config({ path: ".env.production" });

async function testProductionConnection() {
  try {
    console.log("🧪 Testing Production MongoDB Atlas Connection...");
    console.log("Environment:", process.env.NODE_ENV || "development");

    // Production connection string
    const mongoUri =
      process.env.MONGODB_URI ||
      "mongodb+srv://anhbuinhatt_db_user:nhom11@cluster0.ve0bn28.mongodb.net/groupDB_production?retryWrites=true&w=majority&appName=Cluster0";

    console.log(
      "Connecting to:",
      mongoUri.replace(/\/\/([^:]+):([^@]+)@/, "//***:***@")
    );

    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log("✅ Production MongoDB Atlas connected successfully!");

    // Test basic operations
    const databases = await mongoose.connection.db.admin().listDatabases();
    console.log(
      "📊 Available databases:",
      databases.databases.map((db) => db.name)
    );

    // Test collections
    const collections = await mongoose.connection.db
      .listCollections()
      .toArray();
    console.log(
      "📋 Collections in current database:",
      collections.map((col) => col.name)
    );

    // Connection info
    console.log("🔗 Connection details:");
    console.log("  - Host:", mongoose.connection.host);
    console.log("  - Port:", mongoose.connection.port);
    console.log("  - Database:", mongoose.connection.name);
    console.log("  - ReadyState:", mongoose.connection.readyState);

    await mongoose.connection.close();
    console.log("🔐 Connection closed successfully");
  } catch (error) {
    console.error("❌ Production connection failed:", error.message);
    if (error.code) {
      console.error("Error code:", error.code);
    }
    process.exit(1);
  }
}

testProductionConnection();
