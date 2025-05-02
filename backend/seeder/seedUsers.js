const mongoose = require('mongoose');
const colors = require('colors');
const dotenv = require('dotenv');
const User = require('../models/User');

// Load env vars
dotenv.config();

// Connect to DB
mongoose.connect(process.env.MONGODB_URI);

// Sample users with different roles
const users = [
  {
    name: 'Regular User',
    email: 'user@example.com',
    password: 'password123',
    role: 'user'
  },
  {
    name: 'Editor/Knowledge Manager',
    email: 'editor@example.com',
    password: 'password123',
    role: 'editor'
  },
  {
    name: 'Staff Member',
    email: 'staff@example.com',
    password: 'password123',
    role: 'staff'
  },
  {
    name: 'Administrator',
    email: 'admin@example.com',
    password: 'password123',
    role: 'admin'
  },
  {
    name: 'Enterprise Administrator',
    email: 'enterprise@example.com',
    password: 'password123',
    role: 'enterprise_admin'
  }
];

// Import users into DB
const importData = async () => {
  try {
    // Clear existing users (optional)
    // await User.deleteMany();
    
    // Create users
    await User.create(users);
    
    console.log('Users imported successfully'.green.inverse);
    process.exit();
  } catch (err) {
    console.error(`${err}`.red);
    process.exit(1);
  }
};

// Delete all users from DB
const deleteData = async () => {
  try {
    await User.deleteMany();
    
    console.log('All users deleted successfully'.red.inverse);
    process.exit();
  } catch (err) {
    console.error(`${err}`.red);
    process.exit(1);
  }
};

// Check command line arguments
if (process.argv[2] === '-i') {
  importData();
} else if (process.argv[2] === '-d') {
  deleteData();
} else {
  console.log('Please use -i to import or -d to delete users'.yellow);
  process.exit();
}
