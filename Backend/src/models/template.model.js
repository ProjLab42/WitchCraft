const mongoose = require('mongoose');

const templateSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: String,
  // Keep the original paths for backward compatibility
  imageSrc: {
    type: String,
    required: true
  },
  thumbnail: String,
  // Add new fields for SVG content
  templateSvgContent: {
    type: String,
    // Not required initially to support migration
  },
  thumbnailSvgContent: {
    type: String,
    // Not required initially to support migration
  },
  category: {
    type: String,
    enum: ['Professional', 'Creative', 'Academic', 'Simple', 'Modern'],
    default: 'Professional'
  },
  version: {
    type: String,
    default: '1.0.0'
  },
  styles: {
    fontFamily: {
      heading: { type: String, default: 'Georgia, serif' },
      body: { type: String, default: 'Arial, sans-serif' }
    },
    fontSize: {
      name: { type: String, default: '24px' },
      sectionHeading: { type: String, default: '18px' },
      body: { type: String, default: '14px' }
    },
    layout: {
      headerAlignment: { 
        type: String, 
        enum: ['left', 'center', 'right'],
        default: 'left'
      },
      sectionStyle: {
        type: String,
        enum: ['underlined', 'boxed', 'simple'],
        default: 'underlined'
      },
      useColumns: { type: Boolean, default: false }
    },
    colors: {
      primary: { type: String, default: '#000000' },
      secondary: { type: String, default: '#444444' },
      accent: { type: String, default: '#0066cc' }
    }
  },
  sections: {
    defaultOrder: {
      type: [String],
      default: ['experience', 'education', 'skills', 'projects']
    }
  },
  isActive: {
    type: Boolean,
    default: true
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
templateSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Template = mongoose.model('Template', templateSchema);

module.exports = Template;
