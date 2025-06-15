# VDS Deployment Guide for StartupCoders

## Issue: Google OAuth Login Not Working

The login issue on your VDS (https://startupcoders.ru) is likely caused by:

1. **Incorrect OAuth Redirect URLs**: Your Google OAuth app needs to have the correct redirect URLs configured
2. **Environment Variables**: The server needs proper environment variables set
3. **Cookie Configuration**: Secure cookies need proper domain configuration

## Solution Steps

### 1. Update Google OAuth Console

Go to [Google Cloud Console](https://console.cloud.google.com/) and update your OAuth 2.0 Client:

Add these Authorized redirect URIs:
- `https://startupcoders.ru/api/auth/callback/google`
- `https://www.startupcoders.ru/api/auth/callback/google` (if using www)

### 2. Set Environment Variables on VDS

Create a `.env` file on your VDS with these variables:

```bash
# Authentication
VITE_BETTER_AUTH_SECRET=your-secret-here
VITE_BETTER_AUTH_URL=https://startupcoders.ru
BETTER_AUTH_SECRET=your-secret-here
BETTER_AUTH_URL=https://startupcoders.ru

# Google OAuth (use the same credentials as in Google Console)
VITE_GOOGLE_CLIENT_ID=your-google-client-id
VITE_GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# GitHub OAuth
VITE_GITHUB_CLIENT_ID=your-github-client-id
VITE_GITHUB_CLIENT_SECRET=your-github-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Database
DATABASE_URL=your-database-url

# Node Environment
NODE_ENV=production
```

### 3. Build and Deploy

```bash
# Install dependencies
npm install

# Build the application
npm run build

# Start the production server
NODE_ENV=production npm start
```

### 4. Nginx Configuration (if using)

If you're using Nginx as a reverse proxy, ensure it forwards headers correctly:

```nginx
server {
    listen 443 ssl http2;
    server_name startupcoders.ru;

    ssl_certificate /path/to/ssl/cert.pem;
    ssl_certificate_key /path/to/ssl/key.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 5. Debugging Steps

If login still doesn't work:

1. **Check Browser Console**: Look for any errors when clicking the login button
2. **Check Network Tab**: See if the OAuth redirect is happening correctly
3. **Check Server Logs**: Look for any server-side errors
4. **Verify Cookies**: In browser DevTools, check if cookies are being set with correct domain

### 6. Test OAuth Flow

1. Clear all cookies for startupcoders.ru
2. Go to https://startupcoders.ru/login
3. Click "Login with Google"
4. Check if you're redirected to Google
5. After selecting account, check if you're redirected back to https://startupcoders.ru/api/auth/callback/google
6. Finally, you should be redirected to the home page with a session

## Common Issues and Solutions

### Issue: Redirect URI Mismatch
**Solution**: Ensure the redirect URI in Google Console exactly matches what your app uses

### Issue: Cookies Not Being Set
**Solution**: Check that your domain doesn't have conflicting cookies from different subdomains

### Issue: HTTPS/HTTP Mismatch
**Solution**: Ensure all URLs use HTTPS in production

## Code Changes Made

1. **Dynamic Base URL Detection**: Updated auth.ts to dynamically determine the base URL
2. **Improved Cookie Configuration**: Cookies now use secure settings based on HTTPS
3. **Better Environment Variable Handling**: Support for multiple environment variable formats