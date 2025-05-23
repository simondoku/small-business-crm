#!/bin/bash

# Business CRM Deployment Script
# This script deploys both backend and frontend with proper alias management

echo "🚀 Starting Business CRM Deployment..."

# Deploy Backend
echo "📦 Deploying backend..."
cd backend
vercel --prod
BACKEND_URL=$(vercel ls --scope simons-projects-94c78eac | grep "● Ready" | grep "Production" | head -1 | awk '{print $2}')

if [ ! -z "$BACKEND_URL" ]; then
    echo "✅ Backend deployed: $BACKEND_URL"
    
    # Update stable backend alias
    echo "🔗 Updating backend alias..."
    vercel alias set $BACKEND_URL businesscrm-api.vercel.app
    echo "✅ Backend alias updated: https://businesscrm-api.vercel.app"
else
    echo "❌ Backend deployment failed"
    exit 1
fi

# Deploy Frontend
echo "📦 Deploying frontend..."
cd ..
vercel --prod
FRONTEND_URL=$(vercel ls businesscrmfrontend --scope simons-projects-94c78eac | grep "● Ready" | grep "Production" | head -1 | awk '{print $2}')

if [ ! -z "$FRONTEND_URL" ]; then
    echo "✅ Frontend deployed: $FRONTEND_URL"
    
    # Update custom domain alias
    echo "🔗 Updating frontend alias..."
    vercel alias set $FRONTEND_URL www.bcrm.dev
    echo "✅ Frontend alias updated: https://www.bcrm.dev"
else
    echo "❌ Frontend deployment failed"
    exit 1
fi

echo "🎉 Deployment completed successfully!"
echo "🌐 Your app is live at: https://www.bcrm.dev"
echo "🔧 Backend API: https://businesscrm-api.vercel.app"