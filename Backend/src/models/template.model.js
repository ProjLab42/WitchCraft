const mongoose = require('mongoose');

const templateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: String,
  thumbnail: String,
  html: {
    type: String,
    required: true
  },
  css: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['Professional', 'Creative', 'Academic', 'Simple', 'Modern'],
    default: 'Professional'
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
