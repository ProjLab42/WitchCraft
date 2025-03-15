const express = require('express');
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middleware/auth.middleware');
const adminMiddleware = require('../middleware/admin.middleware');
const { check } = require('express-validator');

const router = express.Router();

// Protect all routes
router.use(authMiddleware);

// Get current user profile
router.get('/profile', userController.getUserProfile);
router.get('/h', (req, res) => {
    res.send('Hello World');
}
);

// Update user profile
router.put('/profile', [
  check('name', 'Name is required').optional().notEmpty(),
  check('email', 'Please include a valid email').optional().isEmail(),
  check('phone', 'Phone number format is invalid').optional(),
], userController.updateUserProfile);

// Change password
router.put('/password', [
  check('currentPassword', 'Current password is required').exists(),
  check('newPassword', 'Password must be at least 6 characters').isLength({ min: 6 }),
], userController.changePassword);

// Save parsed resume data to profile
router.post('/profile/resume-data', userController.saveResumeData);

// Upload profile picture
router.post('/profile-picture', userController.uploadProfilePicture);

// Admin only routes
router.use(adminMiddleware);

// Get all users (admin only)
router.get('/', userController.getAllUsers);

// Get user by ID (admin only)
router.get('/:id', userController.getUserById);

// Update user (admin only)
router.put('/:id', userController.updateUser);

// Delete user (admin only)
router.delete('/:id', userController.deleteUser);

module.exports = router;
