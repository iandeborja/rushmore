# Rushmore

A daily webapp game where users create their "Mt. Rushmore" - their top 4 picks for daily questions. Similar to Wordle, it's simple, social, and shareable!

## Features

- **Daily Questions**: New question every day for all users
- **Rushmore Submissions**: Users submit their top 4 picks
- **Voting System**: Upvote/downvote other users' Rushmores
- **Leaderboard**: See the top Rushmores for each day
- **User Authentication**: Sign up, sign in, and track your history
- **Sharing**: Copy your Rushmore to share with friends

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm

### Local Development

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up the database (SQLite for local development):
   ```bash
   npx prisma migrate dev
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3001](http://localhost:3001) in your browser

### Deployment (Vercel + Supabase)

#### 1. Set up Supabase Database

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Go to Settings → Database and copy the connection string
3. Update the connection string to include your password:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
   ```

#### 2. Deploy to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and import your repository
3. Add environment variables in Vercel:
   - `DATABASE_URL`: Your Supabase connection string
   - `NEXTAUTH_URL`: Your Vercel deployment URL
   - `NEXTAUTH_SECRET`: A random secret string

#### 3. Deploy Database Schema

```bash
npx prisma migrate deploy
```

## Tech Stack

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL (Supabase)
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS
- **Deployment**: Vercel

## Project Structure

```
src/
├── app/
│   ├── api/           # API routes
│   ├── auth/          # Authentication pages
│   ├── play/          # Main game page
│   ├── leaderboard/   # Leaderboard page
│   └── layout.tsx     # Root layout
├── components/        # Reusable components
└── prisma/           # Database schema
```

## Development

- The app uses PostgreSQL for production (Supabase)
- Questions rotate daily based on a predefined list
- Users can only submit one Rushmore per day
- Voting is limited to one vote per user per Rushmore

## Future Features

- Friends system
- Historical Rushmores
- Social login (Google, GitHub)
- Mobile app
- Admin panel for managing questions
