const jwt = require("jsonwebtoken");

// Authentication middleware
const authMiddleware = (req, res, next) => {
  // Check if auth is disabled for development
  if (process.env.NODE_ENV === 'development' && process.env.DISABLE_AUTH === 'true') {
    console.log('Auth middleware bypassed for development');
    // Add a mock user for testing
    req.userId = 'test-user-id';
    req.user = { id: 'test-user-id', email: 'test@example.com' };
    return next();
  }

  try {
    // Get token from header
    const token = req.headers.authorization && req.headers.authorization.split(" ")[1];

    if (!token) {
      console.log('Auth failed: No token provided');
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    console.log('Verifying token...');
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Add user ID to request object
    req.userId = decoded.userId;
    req.user = { id: decoded.userId };
    
    console.log('Auth successful for user:', req.userId);
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ 
      message: "Not authorized, invalid token",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = authMiddleware;
