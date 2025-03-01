const jwt = require("jsonwebtoken");

// Authentication middleware
const authMiddleware = (req, res, next) => {
  try {
    // Get token from header
    const token = req.headers.authorization && req.headers.authorization.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Add user ID to request object
    req.userId = decoded.userId;
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: "Not authorized, invalid token" });
  }
};

module.exports = authMiddleware;
