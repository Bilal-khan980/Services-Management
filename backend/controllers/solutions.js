const path = require('path');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Solution = require('../models/Solution');

// @desc      Get all solutions
// @route     GET /api/solutions
// @access    Private/Staff/Admin
exports.getSolutions = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc      Get single solution
// @route     GET /api/solutions/:id
// @access    Private/Staff/Admin
exports.getSolution = asyncHandler(async (req, res, next) => {
  const solution = await Solution.findById(req.params.id).populate({
    path: 'author',
    select: 'name email'
  });

  if (!solution) {
    return next(
      new ErrorResponse(`Solution not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: solution
  });
});

// @desc      Create new solution
// @route     POST /api/solutions
// @access    Private/Staff/Admin
exports.createSolution = asyncHandler(async (req, res, next) => {
  // Add author to req.body
  req.body.author = req.user.id;

  const solution = await Solution.create(req.body);

  res.status(201).json({
    success: true,
    data: solution
  });
});

// @desc      Update solution
// @route     PUT /api/solutions/:id
// @access    Private/Staff/Admin
exports.updateSolution = asyncHandler(async (req, res, next) => {
  let solution = await Solution.findById(req.params.id);

  if (!solution) {
    return next(
      new ErrorResponse(`Solution not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is solution author or admin
  if (
    solution.author.toString() !== req.user.id &&
    req.user.role !== 'admin'
  ) {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update this solution`,
        401
      )
    );
  }

  solution = await Solution.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: solution
  });
});

// @desc      Delete solution
// @route     DELETE /api/solutions/:id
// @access    Private/Admin
exports.deleteSolution = asyncHandler(async (req, res, next) => {
  const solution = await Solution.findById(req.params.id);

  if (!solution) {
    return next(
      new ErrorResponse(`Solution not found with id of ${req.params.id}`, 404)
    );
  }

  await solution.deleteOne();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc      Upload attachment to solution
// @route     PUT /api/solutions/:id/attachment
// @access    Private/Staff/Admin
exports.solutionAttachmentUpload = asyncHandler(async (req, res, next) => {
  const solution = await Solution.findById(req.params.id);

  if (!solution) {
    return next(
      new ErrorResponse(`Solution not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is solution author or admin
  if (
    solution.author.toString() !== req.user.id &&
    req.user.role !== 'admin'
  ) {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update this solution`,
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
  file.name = `solution_${solution._id}_${Date.now()}${path.parse(file.name).ext}`;

  file.mv(`${process.env.FILE_UPLOAD_PATH}/solutions/${file.name}`, async err => {
    if (err) {
      console.error(err);
      return next(new ErrorResponse(`Problem with file upload`, 500));
    }

    // Add file to solution attachments
    solution.attachments.push({
      name: file.name,
      path: `/uploads/solutions/${file.name}`,
      contentType: file.mimetype,
      size: file.size
    });

    await solution.save();

    res.status(200).json({
      success: true,
      data: solution
    });
  });
});
