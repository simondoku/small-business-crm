# Deployment Guide for Small Business CRM

This guide explains how to deploy the Small Business CRM with separate frontend and backend deployments using platforms optimized for traditional Express applications.

## Overview

The Small Business CRM is set up as two separate deployments:

1. Frontend React application (Static hosting)
2. Backend Express API server (Traditional server hosting)

This separation provides better scalability, independent versioning, and clearer separation of concerns.

## Recommended Platforms

### For Backend (Express API):

- **Railway** - Great for Node.js applications with built-in database hosting
- **Render** - Simple deployment with automatic HTTPS and custom domains
- **DigitalOcean App Platform** - Scalable with integrated database options
- **Heroku** - Classic choice for Node.js applications

### For Frontend (React App):

- **Netlify** - Excellent for static React applications
- **Railway Static** - Can host both frontend and backend on same platform
- **GitHub Pages** - Free option for static sites
- **DigitalOcean App Platform** - Can host both tiers

## Backend Deployment (Railway - Recommended)

1. **Connect your repository:**

   ```bash
   # Push your code to GitHub first
   git add .
   git commit -m "Prepare for Railway deployment"
   git push origin main
   ```

2. **Deploy on Railway:**

   - Visit [railway.app](https://railway.app) and sign up
   - Click "Deploy from GitHub repo"
   - Select your repository and the `backend` folder as the root
   - Railway will automatically detect it's a Node.js app

3. **Set environment variables in Railway dashboard:**

   - `MONGO_URI`: Your MongoDB connection string
   - `JWT_SECRET`: Secret for JSON Web Tokens
   - `NODE_ENV`: Set to "production"
   - `PORT`: Railway will set this automatically, but you can override
   - `FRONTEND_URL`: The URL of your frontend application (add after frontend deployment)

4. **Configure Railway settings:**
   - Set start command: `npm start`
   - Set build command: `npm install`
   - Railway will provide a public URL like `https://your-app-name.up.railway.app`

## Alternative Backend Deployment (Render)

1. **Deploy on Render:**

   - Visit [render.com](https://render.com) and sign up
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Set root directory to `backend`

2. **Configure Render settings:**

   - Build Command: `npm install`
   - Start Command: `npm start`
   - Environment: `Node`
   - Plan: Choose based on your needs (Free tier available)

3. **Set environment variables in Render dashboard:**
   - Same variables as Railway above

## Frontend Deployment (Netlify - Recommended)

1. **Build the frontend:**

   ```bash
   # Update your environment configuration first
   # In src/config/environment.js, update the production URL:
   # "https://your-backend-url.up.railway.app/api"

   npm run build
   ```

2. **Deploy on Netlify:**

   - Visit [netlify.com](https://netlify.com) and sign up
   - Drag and drop your `build` folder to Netlify dashboard
   - Or connect your GitHub repository for continuous deployment

3. **Configure build settings (if using Git):**

   - Build command: `npm run build`
   - Publish directory: `build`
   - Node version: `18` (in environment variables)

4. **Set environment variables in Netlify:**
   - `REACT_APP_API_URL`: Your backend URL with `/api` (e.g., `https://your-backend.up.railway.app/api`)
   - `NODE_ENV`: `production`

## Database Options

### MongoDB Atlas (Recommended)

- Cloud-hosted MongoDB
- Works with all deployment platforms
- Free tier available
- Use connection string in `MONGO_URI`

### Railway Database

- PostgreSQL/MySQL if you want to migrate from MongoDB
- Integrated with Railway platform
- Automatic backups

## Full Railway Deployment (Both Frontend & Backend)

If you want everything on one platform:

1. **Deploy backend service:**

   - Follow backend Railway steps above

2. **Deploy frontend as separate service:**
   - Create new Railway service
   - Set root directory to `/` (project root)
   - Build command: `npm run build`
   - Start command: `npx serve -s build -l $PORT`
   - Add `serve` to your dependencies: `npm install --save serve`

## Environment Configuration

### Backend Environment Variables:

```bash
NODE_ENV=production
PORT=5003
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
JWT_SECRET=your-super-secure-jwt-secret
JWT_EXPIRE=30d
FRONTEND_URL=https://your-frontend-url.netlify.app
```

### Frontend Environment Variables:

```bash
REACT_APP_API_URL=https://your-backend.up.railway.app/api
NODE_ENV=production
```

## Local Development with Remote Backend

```bash
# Create .env.local file
REACT_APP_API_URL=https://your-backend.up.railway.app/api

# Start frontend only
npm start
```

## Troubleshooting

### CORS Errors

- Ensure `FRONTEND_URL` is set correctly in backend environment
- Check that frontend URL matches exactly (with/without trailing slash)

### Database Connection Issues

- Verify MongoDB connection string format
- Check if your IP is whitelisted in MongoDB Atlas
- Ensure database name is included in connection string

### Build Failures

- Check Node.js version compatibility
- Verify all environment variables are set
- Review build logs for missing dependencies

### SSL/HTTPS Issues

- Railway and Render provide automatic HTTPS
- Ensure your API calls use HTTPS URLs in production

## Cost Considerations

### Railway:

- Free tier: $5 credit monthly
- Pay-as-you-go after free tier
- Databases included

### Render:

- Free tier for web services (with limitations)
- Paid plans start at $7/month
- Database hosting separate

### Netlify:

- Generous free tier for static sites
- Pro features at $19/month

## Migration from Vercel

If migrating from existing Vercel deployment:

1. Export environment variables from Vercel dashboard
2. Update API URLs in frontend configuration
3. Test thoroughly before switching DNS/domains
4. Consider gradual migration with traffic splitting
