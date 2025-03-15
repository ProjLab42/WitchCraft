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
      phone,
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
    if (phone !== undefined) user.phone = phone;
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
    const { name, email, phone, role } = req.body;
    
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
    if (phone !== undefined) user.phone = phone;
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

// Save parsed resume data to user profile
exports.saveResumeData = async (req, res) => {
  try {
    const userId = req.user.id;
    const parsedData = req.body;
    
    // Get the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Initialize sections if they don't exist
    if (!user.sections) {
      user.sections = {};
    }
    
    // Process personal info
    if (parsedData.personalInfo && parsedData.personalInfo.selected) {
      user.name = parsedData.personalInfo.name || user.name;
      user.email = parsedData.personalInfo.email || user.email;
      user.phone = parsedData.personalInfo.phone || user.phone;
      user.title = parsedData.personalInfo.title || user.title;
      user.location = parsedData.personalInfo.location || user.location;
      user.bio = parsedData.personalInfo.bio || user.bio;
      
      // Process links
      if (parsedData.personalInfo.links) {
        if (!user.links) user.links = {};
        user.links.linkedin = parsedData.personalInfo.links.linkedin || user.links.linkedin;
        user.links.portfolio = parsedData.personalInfo.links.portfolio || user.links.portfolio;
      }
    }
    
    // Process experience
    if (parsedData.experience && parsedData.experience.length > 0) {
      if (!user.sections.experience) user.sections.experience = [];
      
      // Add selected experiences
      const selectedExperiences = parsedData.experience.filter(exp => exp.selected);
      
      for (const exp of selectedExperiences) {
        // Parse period into start/end dates
        let startDate = '';
        let endDate = '';
        let current = false;
        
        if (exp.period) {
          const parts = exp.period.split(' - ');
          startDate = parts[0];
          endDate = parts.length > 1 ? parts[1] : '';
          current = endDate === 'Present';
        }
        
        // Create bullets from bullet points
        const bullets = exp.bulletPoints ? exp.bulletPoints.map(bp => bp.text) : [];
        
        // Create the experience object
        const experience = {
          id: exp.id,
          company: exp.company,
          title: exp.title,
          location: '',
          startDate,
          endDate,
          current,
          description: exp.description,
          bullets
        };
        
        // Add to user's experiences
        user.sections.experience.push(experience);
      }
    }
    
    // Process education
    if (parsedData.education && parsedData.education.length > 0) {
      if (!user.sections.education) user.sections.education = [];
      
      // Add selected education entries
      const selectedEducation = parsedData.education.filter(edu => edu.selected);
      
      for (const edu of selectedEducation) {
        // Parse year into start/end dates
        let startDate = '';
        let endDate = '';
        let current = false;
        
        if (edu.year) {
          const parts = edu.year.split(' - ');
          startDate = parts[0];
          endDate = parts.length > 1 ? parts[1] : parts[0];
          current = endDate === 'Present';
        }
        
        // Try to extract field from degree
        let field = '';
        if (edu.degree && edu.degree.includes(' in ')) {
          const parts = edu.degree.split(' in ');
          field = parts[1];
        }
        
        // Create bullets from bullet points
        const bullets = edu.bulletPoints ? edu.bulletPoints.map(bp => bp.text) : [];
        
        // Create the education object
        const education = {
          id: edu.id,
          institution: edu.institution,
          degree: edu.degree,
          field,
          location: '',
          startDate,
          endDate,
          current,
          gpa: '',
          bullets
        };
        
        // Add to user's education
        user.sections.education.push(education);
      }
    }
    
    // Process skills
    if (parsedData.skills && parsedData.skills.length > 0) {
      if (!user.sections.skills) user.sections.skills = [];
      
      // Add selected skills
      const selectedSkills = parsedData.skills.filter(skill => skill.selected);
      
      for (const skill of selectedSkills) {
        // Create the skill object
        const skillObj = {
          id: skill.id,
          name: skill.name,
          level: 'Intermediate' // Default level
        };
        
        // Add to user's skills
        user.sections.skills.push(skillObj);
      }
    }
    
    // Process projects
    if (parsedData.projects && parsedData.projects.length > 0) {
      if (!user.sections.projects) user.sections.projects = [];
      
      // Add selected projects
      const selectedProjects = parsedData.projects.filter(project => project.selected);
      
      for (const project of selectedProjects) {
        // Create bullets from bullet points
        const bullets = project.bulletPoints ? project.bulletPoints.map(bp => bp.text) : [];
        
        // Create the project object
        const projectObj = {
          id: project.id,
          name: project.name,
          description: project.description,
          link: project.link,
          bullets
        };
        
        // Add to user's projects
        user.sections.projects.push(projectObj);
      }
    }
    
    // Process certifications
    if (parsedData.certifications && parsedData.certifications.length > 0) {
      if (!user.sections.certifications) user.sections.certifications = [];
      
      // Add selected certifications
      const selectedCertifications = parsedData.certifications.filter(cert => cert.selected);
      
      for (const cert of selectedCertifications) {
        // Create bullets from bullet points
        const bullets = cert.bulletPoints ? cert.bulletPoints.map(bp => bp.text) : [];
        
        // Create the certification object
        const certObj = {
          id: cert.id,
          name: cert.name,
          issuer: cert.issuer,
          date: cert.date,
          expirationDate: cert.expirationDate,
          credentialID: cert.credentialId,
          bullets
        };
        
        // Add to user's certifications
        user.sections.certifications.push(certObj);
      }
    }
    
    // Save the user
    await user.save();
    
    res.json({
      message: 'Resume data saved to profile successfully',
      user: {
        name: user.name,
        email: user.email,
        title: user.title
      }
    });
  } catch (error) {
    console.error('Error saving resume data:', error);
    res.status(500).json({ message: 'Error saving resume data to profile' });
  }
};
