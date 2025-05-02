const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Notification = require('../models/Notification');
const sendEmail = require('../utils/sendEmail');

// @desc      Get all notifications for a user
// @route     GET /api/notifications
// @access    Private
exports.getNotifications = asyncHandler(async (req, res, next) => {
  const notifications = await Notification.find({ user: req.user.id })
    .sort({ createdAt: -1 })
    .limit(parseInt(req.query.limit) || 50);
  
  res.status(200).json({
    success: true,
    count: notifications.length,
    data: notifications
  });
});

// @desc      Get unread notification count
// @route     GET /api/notifications/unread/count
// @access    Private
exports.getUnreadCount = asyncHandler(async (req, res, next) => {
  const count = await Notification.countDocuments({ 
    user: req.user.id,
    read: false
  });
  
  res.status(200).json({
    success: true,
    data: { count }
  });
});

// @desc      Mark notification as read
// @route     PUT /api/notifications/:id/read
// @access    Private
exports.markAsRead = asyncHandler(async (req, res, next) => {
  let notification = await Notification.findById(req.params.id);
  
  if (!notification) {
    return next(
      new ErrorResponse(`Notification not found with id of ${req.params.id}`, 404)
    );
  }
  
  // Make sure notification belongs to user
  if (notification.user.toString() !== req.user.id) {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update this notification`,
        401
      )
    );
  }
  
  notification = await Notification.findByIdAndUpdate(
    req.params.id,
    { read: true },
    {
      new: true,
      runValidators: true
    }
  );
  
  res.status(200).json({
    success: true,
    data: notification
  });
});

// @desc      Mark all notifications as read
// @route     PUT /api/notifications/read-all
// @access    Private
exports.markAllAsRead = asyncHandler(async (req, res, next) => {
  await Notification.updateMany(
    { user: req.user.id, read: false },
    { read: true }
  );
  
  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc      Delete notification
// @route     DELETE /api/notifications/:id
// @access    Private
exports.deleteNotification = asyncHandler(async (req, res, next) => {
  const notification = await Notification.findById(req.params.id);
  
  if (!notification) {
    return next(
      new ErrorResponse(`Notification not found with id of ${req.params.id}`, 404)
    );
  }
  
  // Make sure notification belongs to user
  if (notification.user.toString() !== req.user.id) {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to delete this notification`,
        401
      )
    );
  }
  
  await notification.deleteOne();
  
  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc      Create notification
// @route     POST /api/notifications
// @access    Private/Admin
exports.createNotification = asyncHandler(async (req, res, next) => {
  // Create notification
  const notification = await Notification.create(req.body);
  
  // Send email notification if enabled
  if (req.body.sendEmail) {
    try {
      const user = await User.findById(req.body.user);
      
      await sendEmail({
        email: user.email,
        subject: req.body.title,
        message: req.body.message
      });
    } catch (err) {
      console.log('Email could not be sent', err);
    }
  }
  
  res.status(201).json({
    success: true,
    data: notification
  });
});

// Helper function to create a notification (for internal use)
exports.createNotificationHelper = async (data) => {
  try {
    const notification = await Notification.create(data);
    
    // Send email notification if enabled
    if (data.sendEmail) {
      try {
        const User = require('../models/User');
        const user = await User.findById(data.user);
        
        await sendEmail({
          email: user.email,
          subject: data.title,
          message: data.message
        });
      } catch (err) {
        console.log('Email could not be sent', err);
      }
    }
    
    return notification;
  } catch (err) {
    console.error('Error creating notification:', err);
    return null;
  }
};
