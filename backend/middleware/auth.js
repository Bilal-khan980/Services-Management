const jwt = require('jsonwebtoken');
const asyncHandler = require('./async');
const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/User');

// Protect routes
exports.protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Set token from Bearer token in header
    token = req.headers.authorization.split(' ')[1];
  }
  // Set token from cookie
  // else if (req.cookies.token) {
  //   token = req.cookies.token;
  // }

  // Make sure token exists
  if (!token) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user exists
    const user = await User.findById(decoded.id);

    if (!user) {
      return next(new ErrorResponse('User not found', 401));
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('Auth error:', err.message);

    if (err.name === 'JsonWebTokenError') {
      return next(new ErrorResponse('Invalid token', 401));
    } else if (err.name === 'TokenExpiredError') {
      return next(new ErrorResponse('Token expired', 401));
    } else {
      return next(new ErrorResponse('Not authorized to access this route', 401));
    }
  }
});

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    // Enterprise admin has access to everything
    if (req.user.role === 'enterprise_admin') {
      return next();
    }

    // Admin has access to everything except enterprise admin routes
    if (req.user.role === 'admin' && !roles.includes('enterprise_admin')) {
      return next();
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(
          `User role ${req.user.role} is not authorized to access this route`,
          403
        )
      );
    }
    next();
  };
};
