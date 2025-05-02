const mongoose = require('mongoose');
const colors = require('colors');
const dotenv = require('dotenv');
const User = require('./models/User');

// Load env vars
dotenv.config();

// Connect to DB
mongoose.connect(process.env.MONGODB_URI);

// Sample users with different roles (4 users per role)
const users = [
  // Regular Users
  {
    name: 'Regular User 1',
    email: 'user1@example.com',
    password: 'password123',
    role: 'user'
  },
  {
    name: 'Regular User 2',
    email: 'user2@example.com',
    password: 'password123',
    role: 'user'
  },
  {
    name: 'Regular User 3',
    email: 'user3@example.com',
    password: 'password123',
    role: 'user'
  },
  {
    name: 'Regular User 4',
    email: 'user4@example.com',
    password: 'password123',
    role: 'user'
  },

  // Editors/Knowledge Managers
  {
    name: 'Editor 1',
    email: 'editor1@example.com',
    password: 'password123',
    role: 'editor'
  },
  {
    name: 'Editor 2',
    email: 'editor2@example.com',
    password: 'password123',
    role: 'editor'
  },
  {
    name: 'Editor 3',
    email: 'editor3@example.com',
    password: 'password123',
    role: 'editor'
  },
  {
    name: 'Editor 4',
    email: 'editor4@example.com',
    password: 'password123',
    role: 'editor'
  },

  // Staff Members
  {
    name: 'Staff Member 1',
    email: 'staff1@example.com',
    password: 'password123',
    role: 'staff'
  },
  {
    name: 'Staff Member 2',
    email: 'staff2@example.com',
    password: 'password123',
    role: 'staff'
  },
  {
    name: 'Staff Member 3',
    email: 'staff3@example.com',
    password: 'password123',
    role: 'staff'
  },
  {
    name: 'Staff Member 4',
    email: 'staff4@example.com',
    password: 'password123',
    role: 'staff'
  },

  // Administrators
  {
    name: 'Administrator 1',
    email: 'admin1@example.com',
    password: 'password123',
    role: 'admin'
  },
  {
    name: 'Administrator 2',
    email: 'admin2@example.com',
    password: 'password123',
    role: 'admin'
  },
  {
    name: 'Administrator 3',
    email: 'admin3@example.com',
    password: 'password123',
    role: 'admin'
  },
  {
    name: 'Administrator 4',
    email: 'admin4@example.com',
    password: 'password123',
    role: 'admin'
  },

  // Enterprise Administrators
  {
    name: 'Enterprise Administrator 1',
    email: 'enterprise1@example.com',
    password: 'password123',
    role: 'enterprise_admin'
  },
  {
    name: 'Enterprise Administrator 2',
    email: 'enterprise2@example.com',
    password: 'password123',
    role: 'enterprise_admin'
  },
  {
    name: 'Enterprise Administrator 3',
    email: 'enterprise3@example.com',
    password: 'password123',
    role: 'enterprise_admin'
  },
  {
    name: 'Enterprise Administrator 4',
    email: 'enterprise4@example.com',
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
