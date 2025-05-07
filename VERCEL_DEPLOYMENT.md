# Simplified Vercel Deployment Guide

This guide explains how to deploy the IT Service Management Solution to Vercel without file upload functionality.

## Prerequisites

1. A [Vercel account](https://vercel.com/signup)
2. A [MongoDB Atlas account](https://www.mongodb.com/cloud/atlas/register)
3. Git installed on your machine

## Step 1: Set Up MongoDB Atlas

1. Create a new cluster in MongoDB Atlas (the free tier is sufficient)
2. Set up a database user with read/write permissions
3. Configure network access to allow connections from anywhere (0.0.0.0/0)
4. Get your MongoDB connection string from Atlas

## Step 2: Deploy the Backend to Vercel

1. Push your code to a GitHub repository
2. Log in to Vercel and create a new project
3. Import your GitHub repository
4. Configure the project:
   - Set the root directory to `backend`
   - Framework preset: Other
5. Add the following environment variables:
   - `NODE_ENV` = `production`
   - `MONGODB_URI` = Your MongoDB Atlas connection string
   - `JWT_SECRET` = A strong secret key
   - `JWT_EXPIRE` = `30d`
   - `JWT_COOKIE_EXPIRE` = `30`
6. Deploy the project
7. Note the deployment URL (e.g., `https://your-backend-api.vercel.app`)

## Step 3: Deploy the Frontend to Vercel

1. Create a new project in Vercel
2. Import your GitHub repository
3. Configure the project:
   - Set the root directory to `frontend`
   - Framework preset: Vite
4. Add the environment variables:
   - `VITE_APP_NAME` = `ITSM Solution`
   - `VITE_API_URL` = Your backend API URL (e.g., `https://your-backend-api.vercel.app/api`)
5. Deploy the project
6. Note the deployment URL (e.g., `https://your-frontend.vercel.app`)

## Step 4: Update Backend with Frontend URL

1. Go back to your backend project in Vercel
2. Add the `FRONTEND_URL` environment variable with your frontend URL
3. Trigger a redeployment by clicking "Redeploy"

## Step 5: Testing

1. Test user registration and login
2. Test all CRUD operations
3. Test all features of your application

## Troubleshooting

- **CORS Issues**: Ensure the `FRONTEND_URL` in your backend environment variables exactly matches your frontend URL
- **Database Connection Issues**: Check your MongoDB Atlas network settings and connection string
- **API Errors**: Check Vercel logs for your backend project

## Important Note

This deployment does not include file upload functionality. If you need file uploads, you'll need to implement a cloud storage solution like AWS S3, Google Cloud Storage, or Cloudinary.
