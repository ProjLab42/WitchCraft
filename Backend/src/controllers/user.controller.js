const User = require('../models/user.model');
const { validationResult } = require('express-validator');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const Resume = require('../models/resume.model');

// Configure storage for profile pictures
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    const uploadDir = path.join(__dirname, '../../uploads/profile');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: function(req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    // Allow only images
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
}).single('profilePicture');

// Get user profile
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Find the user's resume to get sections
    const resume = await Resume.findOne({ user: req.userId });
    
    // Convert user to a plain object so we can add sections
    const userResponse = user.toObject();
    
    // Add resume sections to the response if available
    if (resume) {
      // Convert customSections from Map to plain object
      const resumeSections = { ...resume.sections };
      
      if (resumeSections.customSections instanceof Map) {
        console.log('Converting customSections from Map to object');
        const customSectionsObj = {};
        resumeSections.customSections.forEach((value, key) => {
          customSectionsObj[key] = value;
        });
        resumeSections.customSections = customSectionsObj;
      }
      
      userResponse.sections = resumeSections;
    } else {
      // Create default empty sections structure
      userResponse.sections = {
        sectionMeta: {
          "experience": { name: "Experience", deletable: true, renamable: true },
          "education": { name: "Education", deletable: true, renamable: true },
          "skills": { name: "Skills", deletable: true, renamable: true },
          "projects": { name: "Projects", deletable: true, renamable: true },
          "certifications": { name: "Certifications", deletable: true, renamable: true }
        },
        experience: [],
        education: [],
        skills: [],
        projects: [],
        certifications: [],
        customSections: {}
      };
    }
    
    res.json(userResponse);
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update user profile
exports.updateUserProfile = async (req, res) => {
  try {
    console.log('Updating user profile...');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { 
      name, 
      email, 
      title, 
      bio, 
      location, 
      links,
      sections 
    } = req.body;
    
    // Check if email already exists for another user
    if (email) {
      const existingUser = await User.findOne({ email, _id: { $ne: req.userId } });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already in use' });
      }
    }

    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('Found user:', user._id.toString());

    // Update basic profile fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (title) user.title = title;
    if (bio) user.bio = bio;
    if (location) user.location = location;
    
    // Update links if provided
    if (links) {
      user.links = {
        linkedin: links.linkedin || user.links?.linkedin || null,
        portfolio: links.portfolio || user.links?.portfolio || null,
        additionalLinks: links.additionalLinks || user.links?.additionalLinks || []
      };
    }

    // Find or create a default resume for the user's profile
    let resume = await Resume.findOne({ user: req.userId });
    
    console.log('Resume found:', resume ? resume._id.toString() : 'None');
    
    if (!resume && sections) {
      console.log('Creating new resume with sections');
      
      // Handle customSections specially since it's a Map in the schema
      let sectionsToSave = { ...sections };
      
      if (sections.customSections) {
        console.log('Custom sections found for new resume:', Object.keys(sections.customSections));
        
        // Convert customSections from plain object to Map
        const customSectionsMap = new Map();
        Object.entries(sections.customSections).forEach(([key, value]) => {
          customSectionsMap.set(key, value);
        });
        
        // Replace customSections in the sections object
        sectionsToSave = {
          ...sectionsToSave,
          customSections: customSectionsMap
        };
      }
      
      // Create a new resume if one doesn't exist
      resume = new Resume({
        user: req.userId,
        title: "Default Profile",
        template: "default",
        sections: sectionsToSave
      });
      
      await resume.save();
      console.log('New resume created:', resume._id.toString());
    } else if (resume && sections) {
      console.log('Updating existing resume sections');
      // Update existing resume sections
      
      // Handle customSections specially since it's a Map in the schema
      if (sections.customSections) {
        console.log('Custom sections found:', Object.keys(sections.customSections));
        
        try {
          // Convert customSections from plain object to Map
          const customSectionsMap = new Map();
          Object.entries(sections.customSections).forEach(([key, value]) => {
            console.log(`Setting custom section ${key}:`, value);
            customSectionsMap.set(key, value);
          });
          
          // Update the resume with the converted Map
          resume.sections.customSections = customSectionsMap;
          
          // Remove customSections from the sections object to avoid overwriting it
          const { customSections, ...otherSections } = sections;
          resume.sections = {
            ...otherSections,
            customSections: resume.sections.customSections
          };
          
          console.log('Resume sections after update:', Object.keys(resume.sections));
        } catch (error) {
          console.error('Error processing customSections:', error);
          throw new Error(`Error processing customSections: ${error.message}`);
        }
      } else {
        resume.sections = sections;
      }
      
      await resume.save();
      console.log('Resume updated');
    }

    await user.save();
    console.log('User saved');
    
    // Return the updated user with resume sections
    const userResponse = user.toObject();
    if (resume) {
      userResponse.sections = resume.sections;
    }
    
    console.log('Sending response with sections:', Object.keys(userResponse.sections || {}));
    
    res.json(userResponse);
  } catch (error) {
    console.error('Update user profile error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ message: 'Server error', details: error.message });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { currentPassword, newPassword } = req.body;
    
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Set and save new password
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Upload profile picture
exports.uploadProfilePicture = async (req, res) => {
  upload(req, res, async function(err) {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ message: `Upload error: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ message: err.message });
    }
    
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const user = await User.findById(req.userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Delete old profile picture if exists
      if (user.profilePicture) {
        const oldPicPath = path.join(__dirname, '../../', user.profilePicture);
        if (fs.existsSync(oldPicPath)) {
          fs.unlinkSync(oldPicPath);
        }
      }

      // Update user with new profile picture path
      const profilePicturePath = `uploads/profile/${req.file.filename}`;
      user.profilePicture = profilePicturePath;
      await user.save();

      res.json({ 
        message: 'Profile picture uploaded successfully',
        profilePicture: profilePicturePath
      });
    } catch (error) {
      console.error('Upload profile picture error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
};

// ADMIN CONTROLLERS

// Get all users (admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user by ID (admin only)
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update user (admin only)
exports.updateUser = async (req, res) => {
  try {
    const { name, email, role } = req.body;
    
    // Check if email already exists for another user
    if (email) {
      const existingUser = await User.findOne({ email, _id: { $ne: req.params.id } });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already in use' });
      }
    }

    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (role && ['user', 'admin'].includes(role)) user.role = role;

    await user.save();
    res.json(user);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete user (admin only)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Don't allow admin to delete themselves
    if (user._id.toString() === req.userId) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    // Delete user's profile picture if exists
    if (user.profilePicture) {
      const picturePath = path.join(__dirname, '../../', user.profilePicture);
      if (fs.existsSync(picturePath)) {
        fs.unlinkSync(picturePath);
      }
    }

    // Delete user
    await user.remove();
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
