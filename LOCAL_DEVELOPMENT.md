# Local Development Guide

## Overview

Your app now has **separate backend and frontend** that run on different ports:

- **Backend (Express.js)**: `http://localhost:3000` (JavaScript)
- **Frontend (React Native Web)**: `http://localhost:8081` (TypeScript)

## Quick Setup

### Option 1: Using Install Scripts (Recommended)

**Linux/Mac:**
```bash
bash install-backend.sh
```

**Windows:**
```bash
install-backend.bat
```

This will automatically:
1. Create package.json in the server folder
2. Install all backend dependencies
3. Show you how to start the server

### Option 2: Manual Installation

```bash
cd server
npm install
```

## Running the Application

You need **2 terminal windows/tabs**:

### Terminal 1: Backend Server

```bash
cd server
npm run dev    # Development with auto-reload
# OR
npm start      # Production mode
```

**✅ Backend running on http://localhost:3000**

### Terminal 2: Frontend App

```bash
# From root directory
bunx expo start --web    # Web only
# OR
bunx expo start          # All platforms (iOS, Android, Web)
```

**✅ Frontend running on http://localhost:8081**

## Verify Everything Works

1. **Backend Health Check:**
   - Open http://localhost:3000
   - Should return: `{"status":"ok","message":"API is running"}`

2. **Frontend:**
   - Open http://localhost:8081
   - Should load your app

3. **Test API Connection:**
   - Try registering or logging in
   - Check both terminal logs for API requests

## Project Structure

```
.
├── server/                      # NEW: Express.js backend
│   ├── index.js                 # Backend server (JavaScript)
│   ├── package.json             # Backend dependencies
│   ├── .env                     # Backend config
│   └── .gitignore
│
├── app/                         # React Native app
│   ├── (tabs)/                  # Tab navigation
│   ├── login.tsx                # Login screen
│   ├── register.tsx             # Register screen
│   └── _layout.tsx              # Root layout
│
├── lib/
│   ├── api-client.ts            # NEW: REST API client
│   ├── auth-context.tsx         # UPDATED: Uses REST API
│   └── trpc.ts                  # OLD: tRPC (no longer used)
│
├── backend/                     # OLD: Hono + tRPC (deprecated)
│
├── .env                         # Frontend environment
├── QUICKSTART.md                # Quick start guide
├── SETUP.md                     # Detailed setup guide
├── install-backend.sh           # Linux/Mac install script
└── install-backend.bat          # Windows install script
```

## Configuration Files

### Frontend: `.env` (root directory)
```env
EXPO_PUBLIC_RORK_API_BASE_URL=http://localhost:3000
```

### Backend: `server/.env`
```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=tourist_map
JWT_SECRET=your_jwt_secret_key_here
```

## API Endpoints

All endpoints are prefixed with `/api`:

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires auth)

### Favorites
- `POST /api/favorites/add` - Add to favorites (requires auth)
- `POST /api/favorites/remove` - Remove from favorites (requires auth)
- `GET /api/favorites/list` - List favorites (requires auth)

### Visited
- `POST /api/visited/add` - Mark as visited (requires auth)
- `GET /api/visited/list` - List visited (requires auth)

### Reviews
- `POST /api/reviews/add` - Add review (requires auth)
- `GET /api/reviews/list/:attractionId` - Get reviews

### Verification
- `POST /api/verification/send-email-code` (requires auth)
- `POST /api/verification/send-phone-code` (requires auth)
- `POST /api/verification/verify-email` (requires auth)
- `POST /api/verification/verify-phone` (requires auth)

## Database Setup

1. **Create database:**
   ```sql
   CREATE DATABASE tourist_map;
   ```

2. **Run initialization:**
   ```bash
   mysql -u root -p tourist_map < backend/db/init.sql
   ```

3. **Verify tables:**
   ```sql
   USE tourist_map;
   SHOW TABLES;
   ```

   Should show: `users`, `favorites`, `visited`, `reviews`, `verifications`

## Testing on Mobile Device

### Same WiFi Network Required

1. **Find your computer's IP address:**
   
   **Mac/Linux:**
   ```bash
   ifconfig | grep "inet "
   ```
   
   **Windows:**
   ```bash
   ipconfig
   ```
   
   Look for something like `192.168.1.XXX`

2. **Update `.env` in root:**
   ```env
   EXPO_PUBLIC_RORK_API_BASE_URL=http://192.168.1.XXX:3000
   ```

3. **Restart both servers**

4. **Scan QR code** from Expo to open on mobile

## Troubleshooting

### Backend won't start

**Check MySQL:**
```bash
# Mac/Linux
mysql -u root -p

# Windows
mysql.exe -u root -p
```

**Verify database exists:**
```sql
SHOW DATABASES;
```

**Check credentials in `server/.env`**

### Frontend can't connect to backend

1. **Verify backend is running:**
   ```bash
   curl http://localhost:3000
   ```

2. **Check `.env` has correct URL:**
   ```env
   EXPO_PUBLIC_RORK_API_BASE_URL=http://localhost:3000
   ```

3. **Restart both servers after changing `.env`**

4. **Check browser console for errors**

### Port already in use

**Backend:**
- Change `PORT` in `server/.env`
- Example: `PORT=3001`

**Frontend:**
- Use different port: `bunx expo start --web --port 8082`

### CORS errors

The backend has CORS enabled by default. If you still see CORS errors:
- Make sure backend is running
- Check frontend is using correct backend URL
- Look at browser console for exact error

## Development Tips

### Backend Hot Reload

Using `npm run dev` enables nodemon for auto-restart on file changes.

### Frontend Hot Reload

Expo automatically reloads when you save files.

### Checking Logs

**Backend logs:**
- Check Terminal 1 for API requests
- Format: `[Auth] Login successful`, `[API] Fetching: /api/auth/me`

**Frontend logs:**
- Check Terminal 2 for Expo output
- Check browser console for client-side logs

### Testing API Manually

Use curl to test endpoints:

```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","name":"Test User"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'

# Get user (requires token)
curl http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## What Changed?

### Before (tRPC + Hono)
- Backend was TypeScript using Hono + tRPC
- Backend ran integrated with Expo dev server
- Used tRPC client for API calls
- Required understanding of tRPC procedures

### After (REST + Express)
- Backend is JavaScript using Express
- Backend runs separately on port 3000
- Uses simple REST API with fetch
- Standard HTTP endpoints

### Migration Summary

**Backend:**
- ✅ Created `server/` folder with Express.js
- ✅ All endpoints converted to REST
- ✅ Same functionality maintained
- ✅ Simpler JavaScript code

**Frontend:**
- ✅ Created `lib/api-client.ts` for REST calls
- ✅ Updated `lib/auth-context.tsx` to use REST
- ✅ Old tRPC code still exists but not used

## Next Steps

- See [QUICKSTART.md](QUICKSTART.md) for quick start
- See [SETUP.md](SETUP.md) for detailed setup
- Check `server/index.js` for backend code
- Check `lib/api-client.ts` for frontend API calls

## Support

For issues:
1. Check terminal logs (both backend and frontend)
2. Check browser console
3. Verify database is running
4. Verify both servers are running
