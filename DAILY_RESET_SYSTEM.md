# Daily Reset System

## Overview
The daily reset system automatically resets the Rushmore question and clears all responses every day at 9:00 AM Pacific Time.

## Features Implemented

### 1. Database Question Management
- Updated `/src/app/api/questions/today/route.ts` to fetch questions from the database
- Updated play page and individual rushmore pages to use the API instead of hardcoded questions

### 2. Daily Reset Script
- Created `/scripts/dailyReset.ts` that:
  - Deletes all rushmores and related votes for the current day
  - Removes the old question
  - Creates a new random question from a predefined list
  - Returns statistics about the reset

### 3. API Endpoint
- Created `/src/app/api/daily-reset/route.ts` to trigger resets via HTTP POST
- Accessible at `POST /api/daily-reset`

### 4. Countdown Timer Component
- Created `/src/components/CountdownTimer.tsx` that:
  - Shows countdown to next 9:00 AM Pacific reset
  - Automatically triggers reset when countdown reaches zero
  - Displays reset status during operation
  - Refreshes the page after successful reset

### 5. UI Integration
- Added countdown timer to the play page
- Timer shows hours:minutes:seconds until next reset
- Displays "resets daily at 9:00 AM Pacific" message

## Manual Usage

### Set a specific question:
```bash
npm run set-question "your custom question here"
```

### Trigger manual reset:
```bash
npm run daily-reset
```

### Trigger reset via API:
```bash
curl -X POST http://localhost:3000/api/daily-reset
```

## Question Pool
The system randomly selects from 25+ predefined questions including:
- "things that make you say \"hell yea, it's summer\""
- "best fast food menu items"
- "worst fashion trends"
- "best comfort foods"
- And many more...

## Technical Details
- Uses Pacific Time zone for consistent daily resets
- Handles database transactions properly
- Cleans up related data (votes, comments, reports) before deleting rushmores
- Provides detailed logging and error handling
- Automatically refreshes UI after reset

## Current Status
✅ All features implemented and tested
✅ Current question: "things that make you say \"hell yea, it's summer\""
✅ Ready for sharing! 