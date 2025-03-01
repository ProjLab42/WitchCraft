const mongoose = require('mongoose');

const cvSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  template: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Template',
    required: true
  },
  personalInfo: {
    fullName: {
      type: String,
      required: true
    },
    jobTitle: String,
    email: String,
    phone: String,
    address: String,
    website: String,
    linkedin: String,
    github: String,
    summary: String
  },
  education: [{
    institution: String,
    degree: String,
    field: String,
    startDate: Date,
    endDate: Date,
    description: String
  }],
  experience: [{
    company: String,
    position: String,
    location: String,
    startDate: Date,
    endDate: Date,
    current: {
      type: Boolean,
      default: false
    },
    description: String,
    achievements: [String]
  }],
  skills: [{
    name: String,
    level: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert']
    }
  }],
  languages: [{
    name: String,
    proficiency: String
  }],
  projects: [{
    title: String,
    description: String,
    technologies: [String],
    link: String,
    startDate: Date,
    endDate: Date
  }],
  certifications: [{
    name: String,
    issuer: String,
    date: Date,
    expires: Date,
    link: String
  }],
  customSections: [{
    title: String,
    content: String
  }],
  shareLink: {
    id: String,
    isActive: {
      type: Boolean,
      default: false
    },
    expiresAt: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamps on save
cvSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const CV = mongoose.model('CV', cvSchema);

module.exports = CV;
