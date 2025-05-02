# IT Service Management (ITSM) Solution

A comprehensive IT Service Management platform for managing tickets, changes, knowledge articles, and internal solutions.

## Features

- **Ticketing Management**: Create, track, and resolve support tickets
- **Change Management**: Submit, review, and approve change requests
- **Knowledge Management**: Create and search knowledge base articles
- **Solutions Management**: Internal staff-only portal for how-to documents
- **User Management**: Role-based access control (User, Editor, Staff, Admin, Enterprise Admin)
- **Email Integration**: Notifications for ticket updates, changes, etc.
- **Authentication**: Secure login with password reset functionality
- **Microsoft 365 Integration**: Single Sign-On with Microsoft 365 accounts
- **Branding Customization**: Customize logo, favicon, banner, and colors

## Technology Stack

- **Frontend**: React.js with Material UI and React Router
- **Backend**: Node.js with Express.js
- **Database**: MongoDB
- **Authentication**: JWT with OAuth 2.0 support
- **Email**: Nodemailer for email notifications
- **Microsoft Integration**: Microsoft Graph API for Microsoft 365 integration
- **Real-time Notifications**: In-app notification system

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

## Installation

### Backend Setup

1. Navigate to the backend directory:
   ```
   cd Services-Management/backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the backend directory (copy from `.env.example`):
   ```
   NODE_ENV=development
   PORT=5000

   MONGODB_URI=mongodb://localhost:27017/itsm-solution

   JWT_SECRET=your_jwt_secret
   JWT_EXPIRE=30d
   JWT_COOKIE_EXPIRE=30

   # Email configuration
   EMAIL_PROVIDER=gmail
   EMAIL_SERVICE=Gmail
   EMAIL_USERNAME=your_email@gmail.com
   EMAIL_PASSWORD=your_email_password
   FROM_NAME=ITSM Solution
   FROM_EMAIL=noreply@itsm-solution.com

   # File upload
   MAX_FILE_UPLOAD=5000000
   FILE_UPLOAD_PATH=./public/uploads

   # Microsoft 365 Integration
   ENABLE_MICROSOFT_365=false
   AZURE_TENANT_ID=your_tenant_id
   AZURE_CLIENT_ID=your_client_id
   AZURE_CLIENT_SECRET=your_client_secret
   ```

4. Start the backend server:
   ```
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd Services-Management/frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the frontend directory (copy from `.env.example`):
   ```
   VITE_APP_NAME=ITSM Solution
   VITE_API_URL=http://localhost:5000/api

   # Microsoft 365 Integration
   VITE_ENABLE_MICROSOFT_365=false
   VITE_AZURE_TENANT_ID=your_tenant_id
   VITE_AZURE_CLIENT_ID=your_client_id
   ```

4. Start the frontend development server:
   ```
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:5173`

## User Roles and Permissions

The application implements a comprehensive role-based access control system with the following roles:

- **User** (Level 1):
  - Can create and view their own tickets and changes
  - Can access public knowledge articles
  - Can comment on knowledge articles

- **Editor/Knowledge Manager** (Level 2):
  - All User permissions
  - Can create/edit knowledge base articles
  - Can create/edit solution articles
  - Can assign tickets for escalation

- **Staff** (Level 3):
  - All Editor permissions
  - Can view all tickets and changes
  - Can update any ticket or change
  - Can manage knowledge articles

- **Admin** (Level 4):
  - All Staff permissions
  - Can delete tickets, changes, knowledge articles, and solutions
  - Can manage users (create/edit/delete/reset user passwords)
  - Can manage system settings
  - Cannot reset Admin or Enterprise Admin passwords

- **Enterprise Admin** (Level 5):
  - Full access to all modules
  - Can create and manage all user roles including Admins
  - Can reset Admin passwords

### Seeding Test Users

To seed the database with test users of all roles, run:

```
cd backend
npm run seed
```

This will create the following users (all with password: `password123`):
- user@example.com (User)
- editor@example.com (Editor/Knowledge Manager)
- staff@example.com (Staff)
- admin@example.com (Admin)
- enterprise@example.com (Enterprise Admin)

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/microsoft` - Login with Microsoft 365
- `GET /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/updatedetails` - Update user details
- `PUT /api/auth/updatepassword` - Update password
- `POST /api/auth/forgotpassword` - Request password reset
- `PUT /api/auth/resetpassword/:resettoken` - Reset password

### Users
- `GET /api/users` - Get all users (Admin only)
- `GET /api/users/:id` - Get single user (Admin only)
- `POST /api/users` - Create user (Admin only)
- `PUT /api/users/:id` - Update user (Admin only)
- `DELETE /api/users/:id` - Delete user (Admin only)

### Tickets
- `GET /api/tickets` - Get all tickets
- `GET /api/tickets/:id` - Get single ticket
- `POST /api/tickets` - Create ticket
- `PUT /api/tickets/:id` - Update ticket
- `DELETE /api/tickets/:id` - Delete ticket (Admin only)
- `PUT /api/tickets/:id/attachment` - Upload attachment to ticket

### Changes
- `GET /api/changes` - Get all changes
- `GET /api/changes/:id` - Get single change
- `POST /api/changes` - Create change
- `PUT /api/changes/:id` - Update change
- `DELETE /api/changes/:id` - Delete change (Admin only)
- `PUT /api/changes/:id/attachment` - Upload attachment to change

### Knowledge
- `GET /api/knowledge` - Get all knowledge articles
- `GET /api/knowledge/:id` - Get single knowledge article
- `POST /api/knowledge` - Create knowledge article (Staff/Admin only)
- `PUT /api/knowledge/:id` - Update knowledge article (Staff/Admin only)
- `DELETE /api/knowledge/:id` - Delete knowledge article (Staff/Admin only)
- `PUT /api/knowledge/:id/attachment` - Upload attachment to knowledge article (Staff/Admin only)
- `PUT /api/knowledge/:id/vote` - Vote on knowledge article
- `GET /api/knowledge/suggest` - Get suggested articles based on keywords

### Solutions
- `GET /api/solutions` - Get all solutions (Staff/Admin only)
- `GET /api/solutions/:id` - Get single solution (Staff/Admin only)
- `POST /api/solutions` - Create solution (Staff/Admin only)
- `PUT /api/solutions/:id` - Update solution (Staff/Admin only)
- `DELETE /api/solutions/:id` - Delete solution (Admin only)
- `PUT /api/solutions/:id/attachment` - Upload attachment to solution (Staff/Admin only)

### Settings
- `GET /api/settings` - Get system settings
- `PUT /api/settings` - Update system settings (Admin/Enterprise Admin only)
- `PUT /api/settings/logo` - Upload logo (Admin/Enterprise Admin only)
- `PUT /api/settings/favicon` - Upload favicon (Admin/Enterprise Admin only)
- `PUT /api/settings/banner` - Upload banner (Admin/Enterprise Admin only)

### Notifications
- `GET /api/notifications` - Get user notifications
- `GET /api/notifications/unread/count` - Get unread notification count
- `PUT /api/notifications/:id/read` - Mark notification as read
- `PUT /api/notifications/read-all` - Mark all notifications as read
- `DELETE /api/notifications/:id` - Delete notification
- `POST /api/notifications` - Create notification (Admin/Enterprise Admin only)

## License

This project is licensed under the ISC License.