# Deployment Guide

This guide will help you deploy Rushmore to production using Vercel and Supabase.

## Prerequisites

- GitHub account
- Vercel account (free)
- Supabase account (free)

## Step 1: Prepare Your Code

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

2. **Update Environment Variables**
   - Your local `.env` file should work for development
   - Production variables will be set in Vercel

## Step 2: Set Up Supabase Database

1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Click "New Project"
   - Choose your organization
   - Enter project name: `rushmore`
   - Set a database password (save this!)
   - Choose a region close to your users

2. **Get Database Connection String**
   - Go to Settings → Database
   - Copy the connection string
   - Replace `[YOUR-PASSWORD]` with your actual password
   - It should look like:
     ```
     postgresql://postgres:yourpassword@db.abcdefghijklmnop.supabase.co:5432/postgres
     ```

## Step 3: Deploy to Vercel

1. **Connect Repository**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will auto-detect Next.js

2. **Configure Environment Variables**
   - In your Vercel project settings, go to "Environment Variables"
   - Add these variables:
     ```
     DATABASE_URL=postgresql://postgres:yourpassword@db.abcdefghijklmnop.supabase.co:5432/postgres
     NEXTAUTH_URL=https://your-project.vercel.app
     NEXTAUTH_SECRET=your-random-secret-string-here
     ```

3. **Deploy**
   - Click "Deploy"
   - Vercel will build and deploy your app

## Step 4: Set Up Database Schema

1. **Install Prisma CLI globally** (if not already installed)
   ```bash
   npm install -g prisma
   ```

2. **Deploy database schema**
   ```bash
   npx prisma migrate deploy
   ```

3. **Generate Prisma client**
   ```bash
   npx prisma generate
   ```

## Step 5: Test Your Deployment

1. Visit your Vercel URL
2. Test the signup/signin flow
3. Submit a Rushmore
4. Test voting functionality

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | Supabase PostgreSQL connection string | `postgresql://postgres:password@db.ref.supabase.co:5432/postgres` |
| `NEXTAUTH_URL` | Your production URL | `https://rushmore.vercel.app` |
| `NEXTAUTH_SECRET` | Random string for JWT encryption | `your-secret-key-here` |

## Troubleshooting

### Database Connection Issues
- Verify your Supabase connection string
- Check that your IP is allowed in Supabase
- Ensure the database password is correct

### Authentication Issues
- Verify `NEXTAUTH_URL` matches your deployment URL
- Check that `NEXTAUTH_SECRET` is set
- Clear browser cookies and try again

### Build Errors
- Check that all dependencies are in `package.json`
- Verify TypeScript types are correct
- Check Vercel build logs for specific errors

## Cost Breakdown

### Free Tier (Recommended for starting)
- **Vercel**: Free (Hobby plan)
- **Supabase**: Free (500MB database, 50MB bandwidth)
- **Total**: $0/month

### Growth Tier
- **Vercel**: $20/month (Pro plan)
- **Supabase**: $25/month (Pro plan)
- **Total**: $45/month

## Next Steps

1. **Custom Domain**: Add your own domain in Vercel
2. **Analytics**: Add Vercel Analytics
3. **Monitoring**: Set up error tracking with Sentry
4. **Backup**: Configure Supabase backups
5. **Scaling**: Monitor usage and upgrade as needed 