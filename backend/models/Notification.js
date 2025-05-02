const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  message: {
    type: String,
    required: [true, 'Please add a message']
  },
  type: {
    type: String,
    enum: ['ticket', 'change', 'knowledge', 'solution', 'system'],
    default: 'system'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  read: {
    type: Boolean,
    default: false
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  relatedItem: {
    type: mongoose.Schema.ObjectId,
    refPath: 'type'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Map the type field to the appropriate model
NotificationSchema.path('type').validate(function(value) {
  const modelMap = {
    ticket: 'Ticket',
    change: 'Change',
    knowledge: 'Knowledge',
    solution: 'Solution',
    system: null
  };

  return modelMap[value] !== undefined;
}, 'Invalid notification type');

module.exports = mongoose.model('Notification', NotificationSchema);
