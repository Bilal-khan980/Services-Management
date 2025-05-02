const path = require('path');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Ticket = require('../models/Ticket');
const User = require('../models/User');
const { createNotificationHelper } = require('./notifications');

// @desc      Get all tickets
// @route     GET /api/tickets
// @access    Private
exports.getTickets = asyncHandler(async (req, res, next) => {
  // If user is not admin, staff, editor, or enterprise_admin, only show their tickets
  if (req.user.role !== 'admin' && req.user.role !== 'staff' && req.user.role !== 'editor' && req.user.role !== 'enterprise_admin') {
    req.query.user = req.user.id;
  }

  res.status(200).json(res.advancedResults);
});

// @desc      Get single ticket
// @route     GET /api/tickets/:id
// @access    Private
exports.getTicket = asyncHandler(async (req, res, next) => {
  // Validate ID format
  if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
    return next(
      new ErrorResponse(`Invalid ticket ID format: ${req.params.id}`, 400)
    );
  }

  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate({
        path: 'user',
        select: 'name email'
      })
      .populate({
        path: 'assignedTo',
        select: 'name email'
      });

    if (!ticket) {
      return next(
        new ErrorResponse(`Ticket not found with id of ${req.params.id}`, 404)
      );
    }

    // Make sure user is ticket owner or has appropriate role
    if (
      ticket.user &&
      ticket.user._id &&
      ticket.user._id.toString() !== req.user.id &&
      req.user.role !== 'admin' &&
      req.user.role !== 'staff' &&
      req.user.role !== 'editor' &&
      req.user.role !== 'enterprise_admin'
    ) {
      return next(
        new ErrorResponse(
          `User ${req.user.id} is not authorized to access this ticket`,
          403
        )
      );
    }

    res.status(200).json({
      success: true,
      data: ticket
    });
  } catch (err) {
    console.error(`Error retrieving ticket: ${err.message}`);
    return next(
      new ErrorResponse(`Error retrieving ticket: ${err.message}`, 500)
    );
  }
});

// @desc      Create new ticket
// @route     POST /api/tickets
// @access    Private
exports.createTicket = asyncHandler(async (req, res, next) => {
  // Add user to req.body
  req.body.user = req.user.id;

  const ticket = await Ticket.create(req.body);

  // Create notification for admins and staff
  try {
    // Find all admins and staff
    const admins = await User.find({
      role: { $in: ['admin', 'staff', 'enterprise_admin'] }
    });

    // Create notifications for each admin/staff
    for (const admin of admins) {
      await createNotificationHelper({
        title: 'New Ticket Created',
        message: `A new ticket "${ticket.title}" has been created and requires attention.`,
        type: 'ticket',
        priority: ticket.priority,
        user: admin._id,
        relatedItem: ticket._id,
        sendEmail: true
      });
    }
  } catch (err) {
    console.error('Error creating notification:', err);
  }

  res.status(201).json({
    success: true,
    data: ticket
  });
});

// @desc      Update ticket
// @route     PUT /api/tickets/:id
// @access    Private
exports.updateTicket = asyncHandler(async (req, res, next) => {
  let ticket = await Ticket.findById(req.params.id);

  if (!ticket) {
    return next(
      new ErrorResponse(`Ticket not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is ticket owner or has appropriate role
  if (
    ticket.user &&
    ticket.user.toString() !== req.user.id &&
    req.user.role !== 'admin' &&
    req.user.role !== 'staff' &&
    req.user.role !== 'editor' &&
    req.user.role !== 'enterprise_admin'
  ) {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update this ticket`,
        401
      )
    );
  }

  // Get the old ticket data before updating
  const oldTicket = { ...ticket.toObject() };

  ticket = await Ticket.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  // Create notification for ticket owner if they didn't make the update
  try {
    if (ticket.user && ticket.user.toString() !== req.user.id) {
      // Create notification for ticket owner
      await createNotificationHelper({
        title: 'Ticket Updated',
        message: `Your ticket "${ticket.title}" has been updated.`,
        type: 'ticket',
        priority: ticket.priority,
        user: ticket.user,
        relatedItem: ticket._id,
        sendEmail: true
      });
    }

    // If status changed, create additional notifications
    if (oldTicket.status !== ticket.status) {
      // Create notification for admins and staff
      const admins = await User.find({
        role: { $in: ['admin', 'staff', 'enterprise_admin'] }
      });

      for (const admin of admins) {
        if (admin._id.toString() !== req.user.id) {
          await createNotificationHelper({
            title: 'Ticket Status Changed',
            message: `Ticket "${ticket.title}" status changed from "${oldTicket.status}" to "${ticket.status}".`,
            type: 'ticket',
            priority: ticket.priority,
            user: admin._id,
            relatedItem: ticket._id,
            sendEmail: false
          });
        }
      }
    }

    // If assigned to someone, notify them
    if (req.body.assignedTo && (!oldTicket.assignedTo || oldTicket.assignedTo.toString() !== req.body.assignedTo)) {
      await createNotificationHelper({
        title: 'Ticket Assigned',
        message: `Ticket "${ticket.title}" has been assigned to you.`,
        type: 'ticket',
        priority: ticket.priority,
        user: req.body.assignedTo,
        relatedItem: ticket._id,
        sendEmail: true
      });
    }
  } catch (err) {
    console.error('Error creating notification:', err);
  }

  res.status(200).json({
    success: true,
    data: ticket
  });
});

// @desc      Delete ticket
// @route     DELETE /api/tickets/:id
// @access    Private
exports.deleteTicket = asyncHandler(async (req, res, next) => {
  const ticket = await Ticket.findById(req.params.id);

  if (!ticket) {
    return next(
      new ErrorResponse(`Ticket not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is ticket owner or has appropriate role
  if (
    ticket.user &&
    ticket.user.toString() !== req.user.id &&
    req.user.role !== 'admin' &&
    req.user.role !== 'enterprise_admin'
  ) {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to delete this ticket`,
        401
      )
    );
  }

  await ticket.deleteOne();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc      Upload attachment to ticket
// @route     PUT /api/tickets/:id/attachment
// @access    Private
exports.ticketAttachmentUpload = asyncHandler(async (req, res, next) => {
  const ticket = await Ticket.findById(req.params.id);

  if (!ticket) {
    return next(
      new ErrorResponse(`Ticket not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is ticket owner or has appropriate role
  if (
    ticket.user &&
    ticket.user.toString() !== req.user.id &&
    req.user.role !== 'admin' &&
    req.user.role !== 'staff' &&
    req.user.role !== 'editor' &&
    req.user.role !== 'enterprise_admin'
  ) {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update this ticket`,
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
  file.name = `ticket_${ticket._id}_${Date.now()}${path.parse(file.name).ext}`;

  file.mv(`${process.env.FILE_UPLOAD_PATH}/tickets/${file.name}`, async err => {
    if (err) {
      console.error(err);
      return next(new ErrorResponse(`Problem with file upload`, 500));
    }

    // Add file to ticket attachments
    ticket.attachments.push({
      name: file.name,
      path: `/uploads/tickets/${file.name}`,
      contentType: file.mimetype,
      size: file.size
    });

    await ticket.save();

    res.status(200).json({
      success: true,
      data: ticket
    });
  });
});
