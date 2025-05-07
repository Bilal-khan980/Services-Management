/**
 * Cloud Storage Utility for File Uploads
 * 
 * This utility provides functions for uploading files to cloud storage.
 * It supports AWS S3 as the default provider but can be extended to support others.
 */

const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');

// Configure AWS SDK
const configureS3 = () => {
  // Check if we have the required environment variables
  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY || !process.env.AWS_BUCKET_NAME) {
    console.error('AWS credentials or bucket name not provided in environment variables');
    return null;
  }

  // Configure AWS SDK
  AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION || 'us-east-1'
  });

  return new AWS.S3();
};

/**
 * Upload a file to S3
 * @param {Object} file - The file object from express-fileupload
 * @param {String} folder - The folder to upload to (e.g., 'tickets', 'changes')
 * @returns {Promise<String>} - The URL of the uploaded file
 */
const uploadToS3 = async (file, folder) => {
  const s3 = configureS3();
  
  if (!s3) {
    throw new Error('S3 not configured properly');
  }

  const bucketName = process.env.AWS_BUCKET_NAME;
  const fileName = `${folder}/${Date.now()}-${file.name}`;

  const params = {
    Bucket: bucketName,
    Key: fileName,
    Body: file.data,
    ContentType: file.mimetype,
    ACL: 'public-read' // Make the file publicly accessible
  };

  try {
    const data = await s3.upload(params).promise();
    return data.Location; // Return the URL of the uploaded file
  } catch (error) {
    console.error('Error uploading to S3:', error);
    throw error;
  }
};

/**
 * Delete a file from S3
 * @param {String} fileUrl - The URL of the file to delete
 * @returns {Promise<Boolean>} - True if deletion was successful
 */
const deleteFromS3 = async (fileUrl) => {
  const s3 = configureS3();
  
  if (!s3) {
    throw new Error('S3 not configured properly');
  }

  const bucketName = process.env.AWS_BUCKET_NAME;
  
  // Extract the key from the URL
  const urlParts = fileUrl.split('/');
  const key = urlParts.slice(3).join('/');

  const params = {
    Bucket: bucketName,
    Key: key
  };

  try {
    await s3.deleteObject(params).promise();
    return true;
  } catch (error) {
    console.error('Error deleting from S3:', error);
    throw error;
  }
};

/**
 * Upload a file to the appropriate storage based on environment
 * In development, saves to local filesystem
 * In production, uploads to S3
 * 
 * @param {Object} file - The file object from express-fileupload
 * @param {String} folder - The folder to upload to (e.g., 'tickets', 'changes')
 * @returns {Promise<String>} - The path or URL of the uploaded file
 */
const uploadFile = async (file, folder) => {
  // In production, use S3
  if (process.env.NODE_ENV === 'production') {
    return await uploadToS3(file, folder);
  }
  
  // In development, use local filesystem
  const uploadPath = process.env.FILE_UPLOAD_PATH || './public/uploads';
  const folderPath = path.join(uploadPath, folder);
  
  // Ensure the folder exists
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
  
  const fileName = `${Date.now()}-${file.name}`;
  const filePath = path.join(folderPath, fileName);
  
  // Move the file to the upload directory
  await file.mv(filePath);
  
  // Return the relative path to the file
  return `/uploads/${folder}/${fileName}`;
};

/**
 * Delete a file from the appropriate storage based on environment
 * 
 * @param {String} filePath - The path or URL of the file to delete
 * @returns {Promise<Boolean>} - True if deletion was successful
 */
const deleteFile = async (filePath) => {
  // In production, delete from S3
  if (process.env.NODE_ENV === 'production') {
    return await deleteFromS3(filePath);
  }
  
  // In development, delete from local filesystem
  // Remove the leading slash if present
  const localPath = filePath.startsWith('/') 
    ? path.join(process.cwd(), 'public', filePath)
    : path.join(process.cwd(), 'public', '/', filePath);
  
  // Check if file exists
  if (fs.existsSync(localPath)) {
    fs.unlinkSync(localPath);
    return true;
  }
  
  return false;
};

module.exports = {
  uploadFile,
  deleteFile
};
