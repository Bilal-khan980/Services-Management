const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const User = require('../models/User');

// @desc      Get all users
// @route     GET /api/users
// @access    Private/Admin
exports.getUsers = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc      Get single user
// @route     GET /api/users/:id
// @access    Private/Admin
exports.getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new ErrorResponse(`User not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc      Create user
// @route     POST /api/users
// @access    Private/Admin
exports.createUser = asyncHandler(async (req, res, next) => {
  const user = await User.create(req.body);

  res.status(201).json({
    success: true,
    data: user
  });
});

// @desc      Update user
// @route     PUT /api/users/:id
// @access    Private/Admin
exports.updateUser = asyncHandler(async (req, res, next) => {
  // First, get the user to be updated
  const userToUpdate = await User.findById(req.params.id);

  if (!userToUpdate) {
    return next(
      new ErrorResponse(`User not found with id of ${req.params.id}`, 404)
    );
  }

  // Prevent admin users from updating other admins or enterprise admins
  if (
    req.user.role === 'admin' &&
    (userToUpdate.role === 'admin' || userToUpdate.role === 'enterprise_admin') &&
    req.user.id !== req.params.id // Allow users to update themselves
  ) {
    return next(
      new ErrorResponse(
        `Admin users cannot update other Admin or Enterprise Admin users`,
        403
      )
    );
  }

  // Prevent non-enterprise admins from changing roles to admin, enterprise_admin, or staff
  if (
    req.user.role !== 'enterprise_admin' &&
    req.body.role &&
    userToUpdate.role !== req.body.role &&
    (req.body.role === 'admin' || req.body.role === 'enterprise_admin' || req.body.role === 'staff')
  ) {
    return next(
      new ErrorResponse(
        `Only Enterprise Admin users can assign Admin, Staff, or Enterprise Admin roles`,
        403
      )
    );
  }

  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc      Delete user
// @route     DELETE /api/users/:id
// @access    Private/Admin
exports.deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new ErrorResponse(`User not found with id of ${req.params.id}`, 404)
    );
  }

  // Prevent admin users from deleting other admins or enterprise admins
  if (
    req.user.role === 'admin' &&
    (user.role === 'admin' || user.role === 'enterprise_admin') &&
    req.user.id !== req.params.id // This check is redundant as users shouldn't delete themselves
  ) {
    return next(
      new ErrorResponse(
        `Admin users cannot delete other Admin or Enterprise Admin users`,
        403
      )
    );
  }

  await user.deleteOne();

  res.status(200).json({
    success: true,
    data: {}
  });
});
