const mongoose = require('mongoose');

const experienceSchema = new mongoose.Schema({
  company: String,
  position: String,
  startDate: String,
  endDate: String,
  description: String
});

const educationSchema = new mongoose.Schema({
  school: String,
  degree: String,
  field: String,
  startDate: String,
  endDate: String
});

const resumeSchema = new mongoose.Schema({
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
    type: String,
    required: true
  },
  data: {
    name: String,
    jobTitle: String,
    email: String,
    phone: String,
    linkedin: String,
    website: String,
    summary: String,
    experiences: [experienceSchema],
    education: [educationSchema],
    skills: String,
    languages: String,
    certificates: String
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

// Update the updatedAt timestamp before saving
resumeSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Resume = mongoose.model('Resume', resumeSchema);

module.exports = Resume;
