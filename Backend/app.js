// const express = require("express");
// const connectDB = require("./src/config/db");
// const dotenv = require("dotenv");

// // Import routes
// const resumeRoutes = require("./src/routes/resume.routes");

// // Load env variables first
// dotenv.config();
// connectDB();

// const app = express();

// // Basic middleware
// app.use(express.json());

// // Simple route for testing
// app.get("/", (req, res) => {
//   res.send("CV Management API is running...");
// });

// // Use routes
// app.use("/api/resume", resumeRoutes);

// // Catch all unhandled errors
// process.on('uncaughtException', (error) => {
//   console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
//   console.error(error.name, error.message, error.stack);
//   process.exit(1);
// });

// // Start the server
// try {
//   const PORT = process.env.PORT || 5001;
//   app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
// } catch (error) {
//   console.error('Error starting server:', error);
// }
