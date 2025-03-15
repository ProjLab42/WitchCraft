const jwt = require("jsonwebtoken");

// Authentication middleware
const authMiddleware = (req, res, next) => {
  // Check if auth is disabled for development
  if (process.env.NODE_ENV === 'development' && process.env.DISABLE_AUTH === 'true') {
    console.log('Auth middleware bypassed for development');
    // Add a mock user for testing with a real user ID from the database
    const mockUserId = '67d5622e0d84c6e93939751d';
    req.userId = mockUserId;
    req.user = { id: mockUserId, email: 'test@example.com' };
    console.log('Using mock user:', { userId: req.userId, user: req.user });
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
    
    // Add user ID to request object - ensure both formats are available
    req.userId = decoded.userId;
    req.user = { id: decoded.userId };
    
    console.log('Auth successful for user:', { userId: req.userId, user: req.user });
    
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
