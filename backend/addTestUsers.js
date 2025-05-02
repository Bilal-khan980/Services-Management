const mongoose = require('mongoose');
const colors = require('colors');
const dotenv = require('dotenv');
const User = require('./models/User');

// Load env vars
dotenv.config();

// Connect to DB
mongoose.connect(process.env.MONGODB_URI);

// Test users with different roles
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
const importUsers = async () => {
  try {
    console.log('Connecting to database...'.yellow);
    
    // Check for existing users with the same emails
    for (const user of users) {
      const existingUser = await User.findOne({ email: user.email });
      if (existingUser) {
        console.log(`User with email ${user.email} already exists, skipping...`.yellow);
      } else {
        // Create user
        await User.create(user);
        console.log(`Created user: ${user.name} (${user.email}) with role: ${user.role}`.green);
      }
    }
    
    console.log('Test users added successfully!'.green.inverse);
    process.exit();
  } catch (err) {
    console.error(`${err}`.red);
    process.exit(1);
  }
};

// Run the import
importUsers();
