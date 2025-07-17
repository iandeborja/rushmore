# Google OAuth Setup Guide

## Step 1: Create Google OAuth Credentials

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
     - For development: `http://localhost:3000/api/auth/callback/google`
     - For production: `https://rushmore.vercel.app/api/auth/callback/google`

## Step 2: Update Environment Variables

Add these to your `.env.local` file:

```
# Change this from "true" to "false" to enable real authentication
NEXT_PUBLIC_USE_MOCK_SESSION="false"

# Add these Google OAuth credentials
GOOGLE_CLIENT_ID="your-google-client-id-from-step-1"
GOOGLE_CLIENT_SECRET="your-google-client-secret-from-step-1"
```

## Step 3: Update Vercel Environment Variables

In your Vercel dashboard, add these environment variables:

```
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
NEXT_PUBLIC_USE_MOCK_SESSION=false
```

## Step 4: Test the Setup

1. Start your development server: `npm run dev`
2. Go to `http://localhost:3000`
3. Click "sign in with google"
4. You should be redirected to Google's OAuth flow
5. After signing in, you'll be redirected to the username setup page
6. Choose your unique username and continue to the app

## What's Changed

- ✅ Removed email/password authentication
- ✅ Added Google OAuth as the only sign-in method
- ✅ Removed signup page (Google handles this automatically)
- ✅ Updated database schema to remove password fields
- ✅ Added username field to User model
- ✅ Created username setup flow for new users
- ✅ Updated UI to show usernames (@username) instead of display names
- ✅ Simplified sign-in flow

## User Experience Flow

1. **New User**: Google Sign-In → Username Setup → Play
2. **Existing User**: Google Sign-In → Play (if username exists)
3. **Username Display**: Shows @username instead of "John Smith"

## Benefits

- **Easier for users**: No need to create/remember passwords
- **More secure**: Google handles all authentication
- **Faster signup**: Users can sign in with one click
- **Better UX**: Familiar Google sign-in flow + unique usernames
- **Personal branding**: Users can choose their own @username

## Username Rules

- 3-20 characters
- Letters, numbers, and underscores only
- Must be unique across all users
- Can be changed later (feature coming soon)

## Next Steps

1. Set up Google OAuth credentials (steps above)
2. Update your environment variables
3. Deploy to Vercel with the new environment variables
4. Test the full flow on production

The app will continue to work with mock sessions until you complete the Google OAuth setup. 