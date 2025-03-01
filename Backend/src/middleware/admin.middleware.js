const User = require('../models/user.model');

// Middleware to check if the user is an admin
const adminMiddleware = async (req, res, next) => {
  try {
    // Get user from database using the userId from auth middleware
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if user has admin role
    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }
    
    // User is admin, proceed
    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = adminMiddleware;
