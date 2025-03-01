const express = require("express");
const connectDB = require("./config/db"); // Import your DB connection

require("dotenv").config(); // Load .env variables

const app = express();

// Connect to MongoDB
connectDB();

app.get("/", (req, res) => {
  res.send("CV Management API is running...");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
