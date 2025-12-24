# 🚀 Local Firestore Emulator Setup Guide

This guide will help you run the FeedBacks recommendations database (and entire Firestore) locally using Firebase Emulator Suite.

## Prerequisites

- Firebase CLI: `npm install -g firebase-tools` (or use the local one already installed)
- Node.js and npm (already installed)
- Next.js dev server running

## Quick Start

### 1️⃣ Start the Firebase Emulator

Open a **new terminal** in your project root and run:

```bash
npm run emulator
```

This will start the Firebase Emulator Suite with:
- **Auth Emulator**: `http://localhost:9099`
- **Firestore Emulator**: `http://localhost:8080`
- **Emulator UI**: `http://localhost:4000` (access this in your browser to view/manage data)

You should see output like:
```
✔ All emulators started, it is now safe to connect your apps.

┌─────────────┬─────────────┬──────────────┐
│ Emulator    │ Host:Port   │ View in UI   │
├─────────────┼─────────────┼──────────────┤
│ Authentication │ localhost:9099 │ http://localhost:4000/auth │
│ Firestore   │ localhost:8080 │ http://localhost:4000/firestore │
└─────────────┴─────────────┴──────────────┘
```

### 2️⃣ Enable Emulator in Your App

In another terminal, start the Next.js dev server with emulator support:

```bash
npm run dev:emulator
```

This sets the `NEXT_PUBLIC_USE_EMULATOR=true` environment variable, which tells the app to connect to the local emulators instead of Firebase production.

You should see in the browser console:
```
✅ Auth Emulator connected on port 9099
✅ Firestore Emulator connected on port 8080
```

### 3️⃣ Access the Emulator UI

Open your browser to **`http://localhost:4000`** to:
- View all Firestore collections and documents
- Create test data manually
- Monitor real-time updates
- View Auth users and sessions

## How It Works

### Environment Variables

The setup uses `NEXT_PUBLIC_USE_EMULATOR` to control emulator mode:

```env
# .env.local
NEXT_PUBLIC_USE_EMULATOR=true   # Connect to local emulators
# or
NEXT_PUBLIC_USE_EMULATOR=false  # Connect to Firebase production
```

When set to `true`, the app connects to:
- Auth Emulator on `localhost:9099`
- Firestore Emulator on `localhost:8080`

### Collections in Local Emulator

All the same collections exist in the emulator:
- `users` - User profiles
- `summarizedFeedbackLogs` - Feedback summaries
- `recommendations` - Recommendations
- `chat` - Chat messages
- etc.

## Common Tasks

### ✨ Reset Emulator Data

Stop the emulator (`Ctrl+C`) and restart:

```bash
npm run emulator
```

This clears all emulated data on restart.

### 💾 Export Emulator Data

To save emulator data to a file for later use:

```bash
npm run emulator:export
```

This creates a `firestore-data/` directory with all current data.

### 📥 Import Emulator Data

To load previously exported data:

```bash
npm run emulator:import
```

This loads data from the `firestore-data/` directory (if it exists).

### 🔍 Debug Firestore Queries

1. Open Emulator UI at `http://localhost:4000`
2. Go to the Firestore tab
3. View all collections and their documents in real-time
4. Check browser console for Firestore query logs

## Firestore Rules Testing

Your existing Firestore rules (`firestore.rules`) work with the emulator:

```bash
npm run test:rules
```

This runs Jest tests against the emulator rules to ensure security policies work correctly.

## Production vs. Local Development

| Feature | Production | Local Emulator |
|---------|-----------|-----------------|
| Data persistence | Firebase Cloud | In-memory (cleared on restart) |
| Auth | Real Google/Email accounts | Test accounts (any email works) |
| Cost | Billing applies | Free |
| Speed | Network latency | Instant local access |
| AI Features | Real Gemini API | Still works with production API key |
| Firestore | Production rules | Test rules locally |

## Troubleshooting

### "Emulator already running on port 8080"

Kill the process using that port:

**Windows (PowerShell):**
```powershell
Get-Process -Name node | Where-Object { $_.Port -eq 8080 } | Stop-Process
# Or manually:
netstat -ano | findstr :8080
taskkill /PID <PID> /F
```

**Mac/Linux:**
```bash
lsof -i :8080
kill -9 <PID>
```

### "Cannot connect to Firestore Emulator"

1. Ensure emulator is running: `npm run emulator`
2. Check that Next.js dev server is using: `npm run dev:emulator`
3. Verify `NEXT_PUBLIC_USE_EMULATOR=true` in your `.env.local`
4. Clear browser cache/restart browser

### "App Check/reCAPTCHA blocking requests"

When using emulators with App Check enabled, you may see warnings. This is normal—the emulator automatically generates debug tokens. To disable App Check in local mode, set:

```env
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=
```

(Empty it out for local development)

## Switching Between Production and Local

### Use Production Firebase:
```bash
npm run dev
# Ensure .env.local has:
# NEXT_PUBLIC_USE_EMULATOR=false
```

### Use Local Emulator:
```bash
npm run dev:emulator
# And in another terminal:
npm run emulator
```

## Next Steps

✅ Local Firestore emulator is ready!
- Create test recommendations in Firestore Emulator UI
- Test feedback summarization against local data
- Run tests with `npm run test:rules`
- Keep emulator running while developing

Happy coding! 🎉
