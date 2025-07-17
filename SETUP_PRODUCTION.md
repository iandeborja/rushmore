# Production Setup Guide

## Issues Fixed

1. **Database Connection Issues**: Updated Prisma configuration to handle pooled connections in serverless environments
2. **Authentication Issues**: Switched from email/password to Google OAuth authentication
3. **API Failures**: Added better error handling and fallback mechanisms
4. **Question Loading**: Improved database query handling with timeouts and fallbacks

## Required Environment Variables

You need to set these environment variables in your Vercel dashboard:

### 1. Database Configuration (Pooled Connection)
```
DATABASE_URL=your-pooled-supabase-connection-string
```

**Important**: Make sure you're using the **pooled connection string** from Supabase, not the direct connection string. It should look like:
```
postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true
```

### 2. NextAuth Configuration
```
NEXTAUTH_URL=https://myrushmore.xyz
NEXTAUTH_SECRET=your-random-secret-string-here
```

### 3. Google OAuth Configuration
```
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### 4. Prisma Data Proxy (for pooled connections)
```
PRISMA_CLIENT_ENGINE_TYPE=dataproxy
```

## Step 1: Set Up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API" and enable it
4. Create OAuth 2.0 credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"
   - Choose "Web application"
   - Set authorized redirect URIs:
     - For production: `https://myrushmore.xyz/api/auth/callback/google`

## Step 2: Get Pooled Database Connection

1. Go to your Supabase dashboard
2. Navigate to Settings → Database
3. Find the "Connection string" section
4. **Use the "Connection pooling" string**, not the direct connection
5. Replace `[YOUR-PASSWORD]` with your actual password

## Step 3: Update Vercel Environment Variables

In your Vercel dashboard:

1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add all the variables listed above
4. **Important**: Use the pooled connection string for `DATABASE_URL`
5. **Note**: You don't need to set `NEXT_PUBLIC_USE_MOCK_SESSION` - it's automatically handled in production

## Step 4: Deploy the Changes

1. Commit and push your changes:
   ```bash
   git add .
   git commit -m "Fix production API issues and switch to Google OAuth"
   git push origin main
   ```

2. Vercel will automatically redeploy

## Step 5: Test the Fixes

1. **Health Check**: Visit `https://myrushmore.xyz/api/health`
   - Should return `{"status":"healthy","database":"connected"}`

2. **Questions API**: Visit `https://myrushmore.xyz/api/questions/today`
   - Should return today's question or a fallback

3. **Authentication**: Try signing in with Google
   - Should redirect to Google OAuth flow

## Troubleshooting

### If Health Check Still Fails
- Verify you're using the **pooled connection string** (not direct)
- Check that your Supabase database is accessible
- Ensure your IP is allowed in Supabase settings
- Check Vercel function logs for connection errors

### If Google OAuth Fails
- Verify `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set
- Check that the redirect URI matches exactly: `https://myrushmore.xyz/api/auth/callback/google`
- Ensure the Google+ API is enabled in your Google Cloud project

### If Questions Still Show Fallback
- Check that your database has questions for today
- Run the ensure question script: `npm run ensure-question`
- Check Vercel function logs for database errors

### Pooled Connection Issues
- Make sure `PRISMA_CLIENT_ENGINE_TYPE=dataproxy` is set
- Verify the connection string includes `?pgbouncer=true`
- Check that the pooled connection is enabled in Supabase

## Database Setup

If you need to set up questions in your database:

1. **Local Development**:
   ```bash
   npm run ensure-question
   npm run set-question "Your question here"
   ```

2. **Production**:
   - Use the API endpoint: `POST /api/questions/today` with a question
   - Or manually insert into your Supabase database

## Cost Optimization

The changes include:
- Better connection pooling for serverless environments
- Reduced database queries with caching
- Improved error handling to prevent unnecessary retries
- Proper handling of pooled connections

This should resolve the "prepared statement already exists" errors and improve reliability. 