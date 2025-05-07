# Step-by-Step Deployment Guide

This guide provides detailed steps to deploy your IT Service Management Solution to Vercel.

## Step 1: Prepare MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) and create an account if you don't have one
2. Create a new project
3. Create a new cluster (the free tier is sufficient)
4. Once the cluster is created, click on "Connect"
5. Create a database user:
   - Click "Add a Database User"
   - Enter a username and password (make sure to remember these)
   - Set privileges to "Read and Write to any database"
   - Click "Add User"
6. Configure network access:
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (0.0.0.0/0)
   - Click "Confirm"
7. Get your connection string:
   - Click "Choose a connection method"
   - Click "Connect your application"
   - Select "Node.js" and the latest version
   - Copy the connection string
   - Replace `<password>` with your database user's password
   - Replace `myFirstDatabase` with `itsm-solution`

## Step 2: Prepare Your Code for Deployment

1. Make sure your code is in a GitHub repository
2. Ensure you have the following files in your project:
   - `backend/vercel.json`
   - `backend/.env.production` (with placeholders)
   - `frontend/.env.production` (with placeholders)

## Step 3: Deploy the Backend to Vercel

1. Go to [Vercel](https://vercel.com/) and sign up or log in
2. Click "Add New" > "Project"
3. Import your GitHub repository
4. Configure the project:
   - Set the root directory to `backend`
   - Framework preset: Select "Other"
   - Build command: Leave as default (npm install)
   - Output directory: Leave as default
5. Add environment variables:
   - `NODE_ENV` = `production`
   - `MONGODB_URI` = Your MongoDB Atlas connection string from Step 1
   - `JWT_SECRET` = A strong random string (you can use [this generator](https://passwordsgenerator.net/))
   - `JWT_EXPIRE` = `30d`
   - `JWT_COOKIE_EXPIRE` = `30`
6. Click "Deploy"
7. Wait for the deployment to complete
8. Note the deployment URL (e.g., `https://your-backend-api.vercel.app`)

## Step 4: Deploy the Frontend to Vercel

1. Go back to Vercel dashboard
2. Click "Add New" > "Project"
3. Import the same GitHub repository
4. Configure the project:
   - Set the root directory to `frontend`
   - Framework preset: Select "Vite"
   - Build command: Leave as default (npm run build)
   - Output directory: Leave as default (dist)
5. Add environment variables:
   - `VITE_APP_NAME` = `ITSM Solution`
   - `VITE_API_URL` = Your backend API URL from Step 3 + `/api` (e.g., `https://your-backend-api.vercel.app/api`)
6. Click "Deploy"
7. Wait for the deployment to complete
8. Note the deployment URL (e.g., `https://your-frontend.vercel.app`)

## Step 5: Update Backend with Frontend URL

1. Go back to your Vercel dashboard
2. Select your backend project
3. Go to "Settings" > "Environment Variables"
4. Add a new environment variable:
   - `FRONTEND_URL` = Your frontend URL from Step 4 (e.g., `https://your-frontend.vercel.app`)
5. Click "Save"
6. Go to "Deployments" tab
7. Click on the three dots next to your latest deployment and select "Redeploy"
8. Wait for the redeployment to complete

## Step 6: Test Your Deployment

1. Open your frontend URL in a browser
2. Try to register a new user
3. Log in with the new user
4. Test creating tickets, changes, knowledge articles, etc.
5. Test all the features of your application

## Troubleshooting

### CORS Issues

If you're experiencing CORS issues:

1. Double-check that the `FRONTEND_URL` in your backend environment variables exactly matches your frontend URL
2. Make sure there's no trailing slash in the URL
3. Redeploy the backend after making changes

### Database Connection Issues

If you're having trouble connecting to the database:

1. Check your MongoDB Atlas network settings to ensure connections are allowed from anywhere
2. Verify your connection string is correct
3. Check that your database user has the correct permissions

### API Errors

If your API calls are failing:

1. Check the Vercel logs for your backend project
2. Make sure your `VITE_API_URL` in the frontend is correct
3. Test the API endpoints directly using a tool like Postman

## Next Steps

Once your basic deployment is working, you might want to:

1. Set up a custom domain for your frontend and backend
2. Implement file uploads using a cloud storage solution
3. Set up continuous deployment from your GitHub repository
