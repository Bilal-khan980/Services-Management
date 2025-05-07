/**
 * File Upload Controller
 * 
 * This controller handles file uploads for the application.
 * It uses the cloudStorage utility to upload files to the appropriate storage.
 */

const { uploadFile, deleteFile } = require('../utils/cloudStorage');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

/**
 * @desc    Upload a file
 * @route   POST /api/upload/:folder
 * @access  Private
 */
exports.uploadFile = asyncHandler(async (req, res, next) => {
  // Check if a file was uploaded
  if (!req.files || Object.keys(req.files).length === 0) {
    return next(new ErrorResponse('No file uploaded', 400));
  }

  const file = req.files.file;
  const folder = req.params.folder;

  // Validate folder
  const validFolders = ['tickets', 'changes', 'knowledge', 'solutions', 'branding'];
  if (!validFolders.includes(folder)) {
    return next(new ErrorResponse(`Invalid folder: ${folder}`, 400));
  }

  // Validate file size
  const maxSize = process.env.MAX_FILE_UPLOAD || 5000000; // 5MB default
  if (file.size > maxSize) {
    return next(new ErrorResponse(`File size cannot exceed ${maxSize / 1000000}MB`, 400));
  }

  // Validate file type (optional, add your own validation logic)
  const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf', 'text/plain'];
  if (!allowedTypes.includes(file.mimetype)) {
    return next(new ErrorResponse('File type not supported', 400));
  }

  try {
    // Upload the file
    const filePath = await uploadFile(file, folder);

    res.status(200).json({
      success: true,
      data: {
        fileName: file.name,
        filePath,
        fileType: file.mimetype,
        fileSize: file.size
      }
    });
  } catch (error) {
    console.error('File upload error:', error);
    return next(new ErrorResponse('Error uploading file', 500));
  }
});

/**
 * @desc    Delete a file
 * @route   DELETE /api/upload/:folder/:fileName
 * @access  Private
 */
exports.deleteFile = asyncHandler(async (req, res, next) => {
  const { folder, fileName } = req.params;

  // Validate folder
  const validFolders = ['tickets', 'changes', 'knowledge', 'solutions', 'branding'];
  if (!validFolders.includes(folder)) {
    return next(new ErrorResponse(`Invalid folder: ${folder}`, 400));
  }

  // Construct the file path
  let filePath;
  if (process.env.NODE_ENV === 'production') {
    // In production, we expect the full URL to be passed in the request body
    filePath = req.body.fileUrl;
    if (!filePath) {
      return next(new ErrorResponse('File URL is required', 400));
    }
  } else {
    // In development, construct the path
    filePath = `/uploads/${folder}/${fileName}`;
  }

  try {
    // Delete the file
    const result = await deleteFile(filePath);

    if (!result) {
      return next(new ErrorResponse('File not found', 404));
    }

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('File deletion error:', error);
    return next(new ErrorResponse('Error deleting file', 500));
  }
});
