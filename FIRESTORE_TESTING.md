# Firestore Security Rules Testing Guide

## Overview
This guide explains how to test the Firestore security rules for the FeedBacks application.

## Setup

### Prerequisites
- Node.js 16+ installed
- Firebase CLI installed: `npm install -g firebase-tools` (already in devDependencies)

### Installation
All required testing packages have been installed:
```bash
npm install  # Already done
```

### Test Commands

#### Option 1: Run Tests with Firebase Emulator (Recommended)

Start the Firestore emulator in one terminal:
```bash
firebase emulators:start
```

In another terminal, run the tests:
```bash
npm run test:rules
```

#### Option 2: Run Tests with Emulator Wrapper
Firebase provides a convenient wrapper to start the emulator, run tests, and stop:
```bash
firebase emulators:exec "npm run test:rules"
```

#### Option 3: Watch Mode for Development
```bash
npm run test:watch
```

## Test Suite Structure

The test suite (`__tests__/firestore.rules.test.ts`) contains comprehensive tests for all collections:

### Users Collection Tests (13 tests)
- ✅ User can create their own profile
- ✅ User cannot create another user profile
- ✅ User can read their own profile
- ✅ User cannot read another user profile
- ✅ User can update their own profile
- ✅ User cannot update another user profile
- ✅ User cannot list all users (privacy)
- ✅ User cannot delete their profile from client
- ✅ Reject user creation with invalid email
- ✅ Reject user creation with invalid sector
- ✅ Accept user creation with null sector
- ✅ Anonymous user cannot create a profile

### Recommendations Collection Tests (8 tests)
- ✅ Anyone can read recommendations (public)
- ✅ Authenticated user can create recommendation for themselves
- ✅ User cannot create recommendation with another user ID
- ✅ Reject recommendation with invalid sector
- ✅ Owner can update their recommendation
- ✅ Non-owner cannot update recommendation
- ✅ Recommendation cannot be deleted from client
- ✅ Anonymous user cannot create recommendation

### Chat Messages Collection Tests (10 tests)
- ✅ Non-anonymous user can create chat message
- ✅ Anonymous user cannot create chat message
- ✅ Unauthenticated user cannot create chat message
- ✅ User cannot create message with another user ID
- ✅ Non-anonymous user can list chat messages
- ✅ Anonymous user cannot list chat messages
- ✅ Chat messages are immutable - cannot update
- ✅ Chat messages are immutable - cannot delete

### Summarized Feedback Logs Collection Tests (9 tests)
- ✅ Authenticated user can create feedback log
- ✅ Authenticated user can create feedback log with null userId
- ✅ Anonymous user can create feedback log
- ✅ Unauthenticated user cannot create feedback log
- ✅ Any authenticated user can read feedback logs
- ✅ Feedback logs are immutable - cannot update
- ✅ Feedback logs are immutable - cannot delete
- ✅ Reject feedback log with empty text

### Catch-All Rules Tests (2 tests)
- ✅ Prevent access to undefined collections
- ✅ Prevent write to undefined collections

## Expected Results

When all tests pass, you should see:
```
Test Suites: 1 passed, 1 total
Tests:       42 passed, 42 total
```

## Troubleshooting

### "Firestore Emulator not running"
Make sure to start the emulator first:
```bash
firebase emulators:start
```

### Port Already in Use
If port 8080 is already in use, stop the process using it:
```bash
# On Windows
netstat -ano | findstr :8080
taskkill /PID <PID> /F

# Or change the port in firebase.json
```

### Firebase Not Authenticated
You may need to authenticate with Firebase:
```bash
firebase login
firebase init firestore
```

## Security Rules Overview

### Key Validation Rules
1. **Email Validation**: Regex pattern ensures valid email format
2. **Sector Validation**: Only allows defined professional sectors
3. **Owner Verification**: Users can only modify their own data
4. **Data Immutability**: Chat and feedback logs cannot be modified
5. **Anonymous User Restrictions**: Some features restricted to authenticated users

### Authorization Patterns
- **Public Read**: Recommendations are publicly readable
- **Private Read**: Users can only read their own profiles
- **Owner-Only Updates**: Users can only update their own content
- **Immutable Records**: Audit trails (feedback, chat) cannot be modified

## Deployment

Before deploying to production:

1. Run the full test suite:
   ```bash
   npm run test:rules
   ```

2. Ensure all tests pass

3. Deploy rules to Firebase:
   ```bash
   firebase deploy --only firestore:rules
   ```

## Files

- `firestore.rules` - Security rules file
- `__tests__/firestore.rules.test.ts` - Complete test suite
- `jest.config.js` - Jest configuration
- `firebase.json` - Firebase emulator configuration

