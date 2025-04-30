const mongoose = require('mongoose');

const ChangeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  impact: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['draft', 'submitted', 'under-review', 'approved', 'rejected', 'implemented', 'closed'],
    default: 'draft'
  },
  category: {
    type: String,
    enum: ['hardware', 'software', 'network', 'security', 'process', 'other'],
    default: 'other'
  },
  plannedStartDate: {
    type: Date,
    required: [true, 'Please add a planned start date']
  },
  plannedEndDate: {
    type: Date,
    required: [true, 'Please add a planned end date']
  },
  actualStartDate: {
    type: Date
  },
  actualEndDate: {
    type: Date
  },
  assignedTo: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  reviewers: [
    {
      user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
      },
      status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
      },
      comments: String,
      reviewedAt: Date
    }
  ],
  attachments: [
    {
      name: String,
      path: String,
      contentType: String,
      size: Number,
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    }
  ],
  comments: [
    {
      text: String,
      user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }
  ],
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Update the updatedAt field on save
ChangeSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Change', ChangeSchema);
