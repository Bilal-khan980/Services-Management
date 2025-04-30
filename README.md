# IT Service Management (ITSM) Solution

A comprehensive IT Service Management platform for managing tickets, changes, knowledge articles, and internal solutions.

## Features

- **Ticketing Management**: Create, track, and resolve support tickets
- **Change Management**: Submit, review, and approve change requests
- **Knowledge Management**: Create and search knowledge base articles
- **Solutions Management**: Internal staff-only portal for how-to documents
- **User Management**: Role-based access control (User, Staff, Admin)
- **Email Integration**: Notifications for ticket updates, changes, etc.
- **Authentication**: Secure login with password reset functionality

## Technology Stack

- **Frontend**: React.js with React Router v7
- **Backend**: Node.js with Express.js
- **Database**: MongoDB
- **Authentication**: JWT with OAuth 2.0 support
- **Email**: Nodemailer for email notifications

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

3. Create a `.env` file in the backend directory with the following variables:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/itsm
   JWT_SECRET=your_jwt_secret_key_here
   JWT_EXPIRE=30d
   EMAIL_SERVICE=outlook
   EMAIL_USERNAME=your_email@outlook.com
   EMAIL_PASSWORD=your_email_password
   EMAIL_FROM=your_email@outlook.com
   MICROSOFT_CLIENT_ID=your_microsoft_client_id
   MICROSOFT_CLIENT_SECRET=your_microsoft_client_secret
   MICROSOFT_TENANT_ID=your_microsoft_tenant_id
   MICROSOFT_CALLBACK_URL=http://localhost:5000/api/auth/microsoft/callback
   NODE_ENV=development
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

3. Create a `.env` file in the frontend directory with the following variables:
   ```
   VITE_API_URL=http://localhost:5000/api
   VITE_APP_NAME=ITSM Solution
   ```

4. Start the frontend development server:
   ```
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:5173`

## User Roles

- **User**: Can create and view their own tickets and changes, access public knowledge articles
- **Staff**: Can manage tickets, changes, and knowledge articles
- **Admin**: Has full access to all features, including user management

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
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

## License

This project is licensed under the ISC License.