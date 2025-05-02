const path = require('path');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Change = require('../models/Change');
const User = require('../models/User');
const { createNotificationHelper } = require('./notifications');

// @desc      Get all changes
// @route     GET /api/changes
// @access    Private
exports.getChanges = asyncHandler(async (req, res, next) => {
  // If user is not admin, staff, editor, or enterprise_admin, only show their changes
  if (req.user.role !== 'admin' && req.user.role !== 'staff' && req.user.role !== 'editor' && req.user.role !== 'enterprise_admin') {
    req.query.user = req.user.id;
  }

  res.status(200).json(res.advancedResults);
});

// @desc      Get single change
// @route     GET /api/changes/:id
// @access    Private
exports.getChange = asyncHandler(async (req, res, next) => {
  // Validate ID format
  if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
    return next(
      new ErrorResponse(`Invalid change ID format: ${req.params.id}`, 400)
    );
  }

  try {
    const change = await Change.findById(req.params.id)
      .populate({
        path: 'user',
        select: 'name email'
      })
      .populate({
        path: 'assignedTo',
        select: 'name email'
      })
      .populate({
        path: 'reviewers.user',
        select: 'name email'
      });

    if (!change) {
      return next(
        new ErrorResponse(`Change not found with id of ${req.params.id}`, 404)
      );
    }

    // Make sure user is change owner or has appropriate role
    if (
      change.user &&
      change.user._id &&
      change.user._id.toString() !== req.user.id &&
      req.user.role !== 'admin' &&
      req.user.role !== 'staff' &&
      req.user.role !== 'editor' &&
      req.user.role !== 'enterprise_admin'
    ) {
      return next(
        new ErrorResponse(
          `User ${req.user.id} is not authorized to access this change`,
          403
        )
      );
    }

    res.status(200).json({
      success: true,
      data: change
    });
  } catch (err) {
    console.error(`Error retrieving change: ${err.message}`);
    return next(
      new ErrorResponse(`Error retrieving change: ${err.message}`, 500)
    );
  }
});

// @desc      Create new change
// @route     POST /api/changes
// @access    Private
exports.createChange = asyncHandler(async (req, res, next) => {
  // Add user to req.body
  req.body.user = req.user.id;

  const change = await Change.create(req.body);

  // Create notification for admins and staff
  try {
    // Find all admins and staff
    const admins = await User.find({
      role: { $in: ['admin', 'staff', 'enterprise_admin'] }
    });

    // Create notifications for each admin/staff
    for (const admin of admins) {
      await createNotificationHelper({
        title: 'New Change Request',
        message: `A new change request "${change.title}" has been submitted and requires review.`,
        type: 'change',
        priority: change.priority,
        user: admin._id,
        relatedItem: change._id,
        sendEmail: true
      });
    }
  } catch (err) {
    console.error('Error creating notification:', err);
  }

  res.status(201).json({
    success: true,
    data: change
  });
});

// @desc      Update change
// @route     PUT /api/changes/:id
// @access    Private
exports.updateChange = asyncHandler(async (req, res, next) => {
  // Validate ID format
  if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
    return next(
      new ErrorResponse(`Invalid change ID format: ${req.params.id}`, 400)
    );
  }

  let change = await Change.findById(req.params.id);

  if (!change) {
    return next(
      new ErrorResponse(`Change not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is change owner or has appropriate role
  if (
    change.user &&
    change.user.toString() !== req.user.id &&
    req.user.role !== 'admin' &&
    req.user.role !== 'staff' &&
    req.user.role !== 'editor' &&
    req.user.role !== 'enterprise_admin'
  ) {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update this change`,
        401
      )
    );
  }

  // Get the old change data before updating
  const oldChange = { ...change.toObject() };

  change = await Change.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  // Create notifications based on the update
  try {
    // If status changed, create notifications
    if (oldChange.status !== change.status) {
      // Notify the change owner if they didn't make the update
      if (change.user && change.user.toString() !== req.user.id) {
        await createNotificationHelper({
          title: 'Change Request Status Updated',
          message: `Your change request "${change.title}" status has been updated to "${change.status}".`,
          type: 'change',
          priority: change.priority,
          user: change.user,
          relatedItem: change._id,
          sendEmail: true
        });
      }

      // Notify admins and staff
      const admins = await User.find({
        role: { $in: ['admin', 'staff', 'enterprise_admin'] }
      });

      for (const admin of admins) {
        if (admin._id.toString() !== req.user.id) {
          await createNotificationHelper({
            title: 'Change Request Status Updated',
            message: `Change request "${change.title}" status changed from "${oldChange.status}" to "${change.status}".`,
            type: 'change',
            priority: change.priority,
            user: admin._id,
            relatedItem: change._id,
            sendEmail: false
          });
        }
      }
    }

    // If a reviewer was added, notify them
    if (req.body.reviewers) {
      const newReviewers = req.body.reviewers.filter(
        reviewer => !oldChange.reviewers.some(
          oldReviewer => oldReviewer.user.toString() === reviewer.user.toString()
        )
      );

      for (const reviewer of newReviewers) {
        await createNotificationHelper({
          title: 'Review Request',
          message: `You have been requested to review change request "${change.title}".`,
          type: 'change',
          priority: change.priority,
          user: reviewer.user,
          relatedItem: change._id,
          sendEmail: true
        });
      }
    }
  } catch (err) {
    console.error('Error creating notification:', err);
  }

  res.status(200).json({
    success: true,
    data: change
  });
});

// @desc      Delete change
// @route     DELETE /api/changes/:id
// @access    Private
exports.deleteChange = asyncHandler(async (req, res, next) => {
  // Validate ID format
  if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
    return next(
      new ErrorResponse(`Invalid change ID format: ${req.params.id}`, 400)
    );
  }

  const change = await Change.findById(req.params.id);

  if (!change) {
    return next(
      new ErrorResponse(`Change not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is change owner or has appropriate role
  if (
    change.user &&
    change.user.toString() !== req.user.id &&
    req.user.role !== 'admin' &&
    req.user.role !== 'enterprise_admin'
  ) {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to delete this change`,
        401
      )
    );
  }

  await change.deleteOne();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc      Upload attachment to change
// @route     PUT /api/changes/:id/attachment
// @access    Private
exports.changeAttachmentUpload = asyncHandler(async (req, res, next) => {
  // Validate ID format
  if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
    return next(
      new ErrorResponse(`Invalid change ID format: ${req.params.id}`, 400)
    );
  }

  const change = await Change.findById(req.params.id);

  if (!change) {
    return next(
      new ErrorResponse(`Change not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is change owner or has appropriate role
  if (
    change.user &&
    change.user.toString() !== req.user.id &&
    req.user.role !== 'admin' &&
    req.user.role !== 'staff' &&
    req.user.role !== 'editor' &&
    req.user.role !== 'enterprise_admin'
  ) {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update this change`,
        401
      )
    );
  }

  if (!req.files) {
    return next(new ErrorResponse(`Please upload a file`, 400));
  }

  const file = req.files.file;

  // Make sure the file is not too large
  if (file.size > process.env.MAX_FILE_UPLOAD) {
    return next(
      new ErrorResponse(
        `Please upload a file less than ${process.env.MAX_FILE_UPLOAD / 1000000}MB`,
        400
      )
    );
  }

  // Create custom filename
  file.name = `change_${change._id}_${Date.now()}${path.parse(file.name).ext}`;

  file.mv(`${process.env.FILE_UPLOAD_PATH}/changes/${file.name}`, async err => {
    if (err) {
      console.error(err);
      return next(new ErrorResponse(`Problem with file upload`, 500));
    }

    // Add file to change attachments
    change.attachments.push({
      name: file.name,
      path: `/uploads/changes/${file.name}`,
      contentType: file.mimetype,
      size: file.size
    });

    await change.save();

    res.status(200).json({
      success: true,
      data: change
    });
  });
});
