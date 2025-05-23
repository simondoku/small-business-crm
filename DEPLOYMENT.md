# Deployment Guide for Small Business CRM

This guide explains how to deploy the Small Business CRM with separate frontend and backend deployments on Vercel.

## Overview

The Small Business CRM is now set up as two separate deployments:
1. Frontend React application
2. Backend Express API server

This separation provides better scalability, independent versioning, and clearer separation of concerns.

## Prerequisites

- Vercel account
- GitHub account (recommended for continuous deployment)
- Access to your MongoDB database

## Backend Deployment

1. **Deploy the backend first:**
   ```bash
   cd backend
   vercel
   ```

2. **Set these environment variables in the Vercel project settings:**
   - `MONGODB_URI`: Your MongoDB connection string
   - `JWT_SECRET`: Secret for JSON Web Tokens
   - `NODE_ENV`: Set to "production"
   - `FRONTEND_URL`: The URL of your frontend application (add this after frontend deployment)
   - Any other environment variables your application uses (Stripe keys, etc.)

3. **Verify deployment:**
   - Visit your backend URL and you should see a JSON response: `{"message":"Small Business CRM API is running","version":"1.0","environment":"production"}`
   - Visit `{your-backend-url}/api/health` to confirm the API is working

## Frontend Deployment

1. **Update your frontend configuration:**
   - In `src/config/environment.js`, replace `https://your-backend-url.vercel.app/api` with your actual backend URL

2. **Deploy the frontend:**
   ```bash
   # From the project root
   vercel
   ```

3. **Set these environment variables in the Vercel project settings:**
   - `REACT_APP_API_URL`: The URL of your backend API with `/api` at the end (e.g., `https://your-backend-url.vercel.app/api`)
   - `NODE_ENV`: Set to "production"
   - Any other environment variables your application uses

## Connecting the Applications

1. **Update CORS settings:**
   - After deploying the frontend, add its URL to the backend's Vercel environment variables as `FRONTEND_URL`
   - Redeploy the backend if needed to apply the CORS changes

2. **Test the connection:**
   - Log in to your frontend application
   - Verify that API calls are successfully reaching the backend

## Local Development with Remote Backend

You can still develop locally while using the deployed backend:

```bash
# Update your .env.development file
REACT_APP_API_URL=https://your-backend-url.vercel.app/api

# Start the frontend only
npm start
```

## Troubleshooting

### CORS Errors
If you see CORS errors in the console:
1. Verify that the backend `FRONTEND_URL` environment variable is set correctly
2. Check that your API requests include the proper headers

### Authentication Issues
If login fails after deployment:
1. Check that the JWT_SECRET is properly set on the backend
2. Verify that the API URL in the frontend is correct

### API Connection Problems
If the frontend can't connect to the backend:
1. Confirm the backend is running with a request to `/api/health`
2. Check network requests in the browser developer tools
3. Verify that the `REACT_APP_API_URL` is set correctly

## Further Optimizations

- Set up custom domains for both applications
- Configure CI/CD pipelines for automated testing and deployment
- Set up monitoring and error tracking services