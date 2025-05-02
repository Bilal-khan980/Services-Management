const mongoose = require('mongoose');

const SettingSchema = new mongoose.Schema({
  siteName: {
    type: String,
    default: 'ITSM Solution'
  },
  logo: {
    type: String,
    default: '/uploads/branding/default-logo.png'
  },
  favicon: {
    type: String,
    default: '/uploads/branding/default-favicon.ico'
  },
  banner: {
    type: String,
    default: '/uploads/branding/default-banner.jpg'
  },
  companyName: {
    type: String,
    default: 'Your Company'
  },
  contactEmail: {
    type: String,
    default: 'contact@example.com'
  },
  contactPhone: {
    type: String,
    default: '+1 (555) 123-4567'
  },
  contactAddress: {
    type: String,
    default: '123 Main St, City, Country'
  },
  primaryColor: {
    type: String,
    default: '#1976d2' // Default MUI primary color
  },
  secondaryColor: {
    type: String,
    default: '#dc004e' // Default MUI secondary color
  },
  updatedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field on save
SettingSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Setting', SettingSchema);
