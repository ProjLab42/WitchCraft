const jwt = require("jsonwebtoken");

// Authentication middleware
const authMiddleware = (req, res, next) => {
  console.log('Auth middleware triggered for path:', req.path);
  console.log('Request headers:', req.headers);

  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    console.log('Authorization header:', authHeader);
    
    const token = authHeader && authHeader.split(" ")[1];
    console.log('Extracted token:', token ? `${token.substring(0, 10)}...` : 'No token');

    // In development, if no token is provided and auth is disabled, use mock user
    if (!token && process.env.NODE_ENV === 'development' && process.env.DISABLE_AUTH === 'true') {
      console.log('No token provided, using mock user for development');
      const mockUserId = '67d5622e0d84c6e93939751d';
      req.userId = mockUserId;
      req.user = { id: mockUserId, email: 'test@example.com' };
      console.log('Using mock user:', { userId: req.userId, user: req.user });
      return next();
    }

    if (!token) {
      console.log('Auth failed: No token provided');
      return res.status(401).json({ 
        message: "Not authorized, no token",
        headers: req.headers // Include headers in development for debugging
      });
    }

    console.log('Verifying token...');
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token decoded successfully:', { userId: decoded.userId });
    
    // Add user ID to request object - ensure both formats are available
    req.userId = decoded.userId;
    req.user = { id: decoded.userId };
    
    console.log('Auth successful for user:', { userId: req.userId, user: req.user });
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', {
      name: error.name,
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
    
    res.status(401).json({ 
      message: "Not authorized, invalid token",
      error: process.env.NODE_ENV === 'development' ? {
        name: error.name,
        message: error.message
      } : undefined
    });
  }
};

module.exports = authMiddleware;
