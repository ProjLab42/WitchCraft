const express = require("express");
const cors = require("cors");
const path = require("path");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const templateService = require('./services/template.service');

// Load env variables
dotenv.config();

// Connect to database
connectDB().then(() => {
  console.log('MongoDB Connected');
  // Initialize default templates if needed
  templateService.initializeDefaultTemplates()
    .then(() => console.log('Template initialization check complete'))
    .catch(err => console.error('Template initialization error:', err));
}).catch(err => console.error('MongoDB connection error:', err));

// Import routes
const authRoutes = require('./routes/auth.routes');
const resumeRoutes = require('./routes/resume.routes');
const templateRoutes = require('./routes/template.routes');
const userRoutes = require('./routes/user.routes');
const uploadRoutes = require('./routes/upload.routes');

const app = express();

// Middleware
const corsOptions = {
  origin: function(origin, callback) {
    // Allow requests from any localhost port
    if (!origin || origin.match(/^https?:\/\/localhost:[0-9]+$/) || origin.match(/^https?:\/\/127\.0\.0\.1:[0-9]+$/)) {
      callback(null, true);
    } else {
      console.log('CORS blocked request from:', origin);
      callback(null, false);
    }
  },
  credentials: true, // Allow cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

console.log('CORS configured with options:', corsOptions);

// Apply middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Add a health endpoint for testing
app.get('/health', (req, res) => {
  console.log('Health check endpoint hit');
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Add an /api/health endpoint as well (for frontend connection testing)
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Add an /api/health endpoint as well (for frontend connection testing)
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Static folder for uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Base route
app.get("/", (req, res) => {
  res.send("CV Management API is running...");
});

// Use routes
app.use("/api/auth", authRoutes);
app.use("/api/resume", resumeRoutes);
app.use("/api/template", templateRoutes);
app.use("/api/user", userRoutes);
app.use("/api/upload", uploadRoutes);

// Log registered routes
console.log('Registered routes:');
console.log('- /api/auth');
console.log('- /api/resume');
console.log('- /api/template');
console.log('- /api/user');
console.log('- /api/upload');

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Global error handler caught:', err);
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Server Error', 
    error: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;
