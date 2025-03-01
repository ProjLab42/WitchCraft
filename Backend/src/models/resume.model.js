const mongoose = require('mongoose');

// Schema for bullet points that can be used in various sections
const bulletPointSchema = new mongoose.Schema({
  id: {
    type: String,
    default: () => new mongoose.Types.ObjectId().toString()
  },
  text: {
    type: String,
    required: true
  }
});

// Experience schema with bullet points
const experienceSchema = new mongoose.Schema({
  id: {
    type: String,
    default: () => new mongoose.Types.ObjectId().toString()
  },
  title: String,
  company: String,
  period: String,
  description: String,
  bulletPoints: [bulletPointSchema]
});

// Education schema with bullet points
const educationSchema = new mongoose.Schema({
  id: {
    type: String,
    default: () => new mongoose.Types.ObjectId().toString()
  },
  degree: String,
  institution: String,
  year: String,
  description: String,
  bulletPoints: [bulletPointSchema]
});

// Skills schema
const skillSchema = new mongoose.Schema({
  id: {
    type: String,
    default: () => new mongoose.Types.ObjectId().toString()
  },
  name: String
});

// Projects schema with bullet points
const projectSchema = new mongoose.Schema({
  id: {
    type: String, 
    default: () => new mongoose.Types.ObjectId().toString()
  },
  name: String,
  description: String,
  link: String,
  bulletPoints: [bulletPointSchema]
});

// Certifications schema with bullet points
const certificationSchema = new mongoose.Schema({
  id: {
    type: String,
    default: () => new mongoose.Types.ObjectId().toString()
  },
  name: String,
  issuer: String,
  date: String,
  expirationDate: String,
  credentialId: String,
  bulletPoints: [bulletPointSchema]
});

// Schema for section metadata
const sectionMetaSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  deletable: {
    type: Boolean,
    default: true
  },
  renamable: {
    type: Boolean,
    default: true
  }
});

// Custom section schema for user-defined sections
const customSectionSchema = new mongoose.Schema({
  id: {
    type: String,
    default: () => new mongoose.Types.ObjectId().toString()
  },
  title: String,
  content: String,
  items: [{
    id: {
      type: String,
      default: () => new mongoose.Types.ObjectId().toString()
    },
    title: String,
    subtitle: String,
    date: String,
    description: String,
    bulletPoints: [bulletPointSchema]
  }]
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
    summary: String
  },
  sections: {
    // Section metadata
    sectionMeta: {
      type: Map,
      of: sectionMetaSchema,
      default: {
        "experience": { name: "Experience", deletable: true, renamable: true },
        "education": { name: "Education", deletable: true, renamable: true },
        "skills": { name: "Skills", deletable: true, renamable: true },
        "projects": { name: "Projects", deletable: true, renamable: true },
        "certifications": { name: "Certifications", deletable: true, renamable: true }
      }
    },
    experience: [experienceSchema],
    education: [educationSchema],
    skills: [skillSchema],
    projects: [projectSchema],
    certifications: [certificationSchema],
    // Custom sections created by users
    customSections: {
      type: Map,
      of: customSectionSchema,
      default: {}
    }
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