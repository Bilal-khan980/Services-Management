const fs = require('fs');
const path = require('path');

// Create directories
const dirs = [
  './public',
  './public/uploads',
  './public/uploads/tickets',
  './public/uploads/changes',
  './public/uploads/knowledge',
  './public/uploads/solutions'
];

dirs.forEach(dir => {
  const fullPath = path.join(__dirname, dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
    console.log(`Created directory: ${fullPath}`);
  } else {
    console.log(`Directory already exists: ${fullPath}`);
  }
});

console.log('All directories created successfully!');
