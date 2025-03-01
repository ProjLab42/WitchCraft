const mongoose = require("mongoose");
require("dotenv").config(); // To use environment variables

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB Connected...");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1); // Stop the server if DB fails to connect
  }
};

module.exports = connectDB;
