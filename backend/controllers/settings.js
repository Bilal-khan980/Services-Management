const path = require('path');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Setting = require('../models/Setting');

// @desc      Get settings
// @route     GET /api/settings
// @access    Public
exports.getSettings = asyncHandler(async (req, res, next) => {
  // Get settings or create default if none exists
  let settings = await Setting.findOne();
  
  if (!settings) {
    settings = await Setting.create({});
  }
  
  res.status(200).json({
    success: true,
    data: settings
  });
});

// @desc      Update settings
// @route     PUT /api/settings
// @access    Private/Admin/EnterpriseAdmin
exports.updateSettings = asyncHandler(async (req, res, next) => {
  // Get settings or create default if none exists
  let settings = await Setting.findOne();
  
  if (!settings) {
    settings = await Setting.create({});
  }
  
  // Add updatedBy to req.body
  req.body.updatedBy = req.user.id;
  
  // Update settings
  settings = await Setting.findByIdAndUpdate(settings._id, req.body, {
    new: true,
    runValidators: true
  });
  
  res.status(200).json({
    success: true,
    data: settings
  });
});

// @desc      Upload logo
// @route     PUT /api/settings/logo
// @access    Private/Admin/EnterpriseAdmin
exports.uploadLogo = asyncHandler(async (req, res, next) => {
  // Get settings or create default if none exists
  let settings = await Setting.findOne();
  
  if (!settings) {
    settings = await Setting.create({});
  }
  
  if (!req.files) {
    return next(new ErrorResponse(`Please upload a file`, 400));
  }
  
  const file = req.files.file;
  
  // Make sure the image is a photo
  if (!file.mimetype.startsWith('image')) {
    return next(new ErrorResponse(`Please upload an image file`, 400));
  }
  
  // Check filesize
  if (file.size > process.env.MAX_FILE_UPLOAD) {
    return next(
      new ErrorResponse(
        `Please upload an image less than ${process.env.MAX_FILE_UPLOAD / 1000000}MB`,
        400
      )
    );
  }
  
  // Create custom filename
  file.name = `logo_${Date.now()}${path.parse(file.name).ext}`;
  
  // Create branding directory if it doesn't exist
  const uploadPath = `${process.env.FILE_UPLOAD_PATH}/branding`;
  const fs = require('fs');
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }
  
  file.mv(`${uploadPath}/${file.name}`, async err => {
    if (err) {
      console.error(err);
      return next(new ErrorResponse(`Problem with file upload`, 500));
    }
    
    // Update settings with logo path
    settings = await Setting.findByIdAndUpdate(
      settings._id,
      { 
        logo: `/uploads/branding/${file.name}`,
        updatedBy: req.user.id
      },
      {
        new: true,
        runValidators: true
      }
    );
    
    res.status(200).json({
      success: true,
      data: settings
    });
  });
});

// @desc      Upload favicon
// @route     PUT /api/settings/favicon
// @access    Private/Admin/EnterpriseAdmin
exports.uploadFavicon = asyncHandler(async (req, res, next) => {
  // Get settings or create default if none exists
  let settings = await Setting.findOne();
  
  if (!settings) {
    settings = await Setting.create({});
  }
  
  if (!req.files) {
    return next(new ErrorResponse(`Please upload a file`, 400));
  }
  
  const file = req.files.file;
  
  // Check filesize
  if (file.size > process.env.MAX_FILE_UPLOAD) {
    return next(
      new ErrorResponse(
        `Please upload a favicon less than ${process.env.MAX_FILE_UPLOAD / 1000000}MB`,
        400
      )
    );
  }
  
  // Create custom filename
  file.name = `favicon_${Date.now()}${path.parse(file.name).ext}`;
  
  // Create branding directory if it doesn't exist
  const uploadPath = `${process.env.FILE_UPLOAD_PATH}/branding`;
  const fs = require('fs');
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }
  
  file.mv(`${uploadPath}/${file.name}`, async err => {
    if (err) {
      console.error(err);
      return next(new ErrorResponse(`Problem with file upload`, 500));
    }
    
    // Update settings with favicon path
    settings = await Setting.findByIdAndUpdate(
      settings._id,
      { 
        favicon: `/uploads/branding/${file.name}`,
        updatedBy: req.user.id
      },
      {
        new: true,
        runValidators: true
      }
    );
    
    res.status(200).json({
      success: true,
      data: settings
    });
  });
});

// @desc      Upload banner
// @route     PUT /api/settings/banner
// @access    Private/Admin/EnterpriseAdmin
exports.uploadBanner = asyncHandler(async (req, res, next) => {
  // Get settings or create default if none exists
  let settings = await Setting.findOne();
  
  if (!settings) {
    settings = await Setting.create({});
  }
  
  if (!req.files) {
    return next(new ErrorResponse(`Please upload a file`, 400));
  }
  
  const file = req.files.file;
  
  // Make sure the image is a photo
  if (!file.mimetype.startsWith('image')) {
    return next(new ErrorResponse(`Please upload an image file`, 400));
  }
  
  // Check filesize
  if (file.size > process.env.MAX_FILE_UPLOAD) {
    return next(
      new ErrorResponse(
        `Please upload an image less than ${process.env.MAX_FILE_UPLOAD / 1000000}MB`,
        400
      )
    );
  }
  
  // Create custom filename
  file.name = `banner_${Date.now()}${path.parse(file.name).ext}`;
  
  // Create branding directory if it doesn't exist
  const uploadPath = `${process.env.FILE_UPLOAD_PATH}/branding`;
  const fs = require('fs');
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }
  
  file.mv(`${uploadPath}/${file.name}`, async err => {
    if (err) {
      console.error(err);
      return next(new ErrorResponse(`Problem with file upload`, 500));
    }
    
    // Update settings with banner path
    settings = await Setting.findByIdAndUpdate(
      settings._id,
      { 
        banner: `/uploads/branding/${file.name}`,
        updatedBy: req.user.id
      },
      {
        new: true,
        runValidators: true
      }
    );
    
    res.status(200).json({
      success: true,
      data: settings
    });
  });
});
