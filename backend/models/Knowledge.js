const mongoose = require('mongoose');

const KnowledgeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  content: {
    type: String,
    required: [true, 'Please add content']
  },
  category: {
    type: String,
    enum: ['hardware', 'software', 'network', 'security', 'how-to', 'faq', 'other'],
    default: 'other'
  },
  tags: [String],
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  visibility: {
    type: String,
    enum: ['public', 'internal', 'private'],
    default: 'public'
  },
  votes: {
    upvotes: {
      type: Number,
      default: 0
    },
    downvotes: {
      type: Number,
      default: 0
    },
    voters: [
      {
        user: {
          type: mongoose.Schema.ObjectId,
          ref: 'User'
        },
        vote: {
          type: String,
          enum: ['up', 'down']
        },
        votedAt: {
          type: Date,
          default: Date.now
        }
      }
    ]
  },
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
  author: {
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

// Create index for search
KnowledgeSchema.index({ title: 'text', content: 'text', tags: 'text' });

// Update the updatedAt field on save
KnowledgeSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Knowledge', KnowledgeSchema);
