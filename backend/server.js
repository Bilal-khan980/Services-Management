const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const colors = require('colors');
const cors = require('cors');
const fileupload = require('express-fileupload');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/error');

// Load env vars
dotenv.config();

// Create upload directories
const createUploadDirs = () => {
  const uploadPath = process.env.FILE_UPLOAD_PATH || './public/uploads';
  const dirs = [
    uploadPath,
    `${uploadPath}/tickets`,
    `${uploadPath}/changes`,
    `${uploadPath}/knowledge`,
    `${uploadPath}/solutions`,
    `${uploadPath}/branding`
  ];

  dirs.forEach(dir => {
    const fullPath = path.resolve(dir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
      console.log(`Created directory: ${fullPath}`.green);
    }
  });
};

// Create necessary directories
createUploadDirs();

// Connect to database
connectDB();

// Route files
const auth = require('./routes/auth');
const users = require('./routes/users');
const tickets = require('./routes/tickets');
const changes = require('./routes/changes');
const knowledge = require('./routes/knowledge');
const solutions = require('./routes/solutions');
const dashboard = require('./routes/dashboard');
const settings = require('./routes/settings');
const notifications = require('./routes/notifications');

const app = express();

// Body parser
app.use(express.json());

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// File uploading
app.use(fileupload());

// Sanitize data
app.use(mongoSanitize());

// Set security headers
app.use(helmet());

// Prevent XSS attacks
app.use(xss());

// Rate limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 mins
  max: 100
});
app.use(limiter);

// Enable CORS
app.use(cors());

// Set static folder
app.use(express.static('public'));

// Mount routers
app.use('/api/auth', auth);
app.use('/api/users', users);
app.use('/api/tickets', tickets);
app.use('/api/changes', changes);
app.use('/api/knowledge', knowledge);
app.use('/api/solutions', solutions);
app.use('/api/dashboard', dashboard);
app.use('/api/settings', settings);
app.use('/api/notifications', notifications);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(
  PORT,
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
  )
);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`.red);
  // Close server & exit process
  server.close(() => process.exit(1));
});
