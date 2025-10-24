# Summary of Changes

## What Was Done

Your app has been successfully converted to use **separate backend and frontend servers** with different ports:

- ✅ **Backend**: Express.js (JavaScript) on `http://localhost:3000`
- ✅ **Frontend**: React Native Web on `http://localhost:8081`

## Files Created

### Backend (New)
```
server/
├── index.js          # Express.js server in JavaScript
├── .env              # Backend environment variables
└── .gitignore        # Git ignore for backend
```

### Frontend API Client (New)
```
lib/
└── api-client.ts     # REST API client replacing tRPC
```

### Documentation (New)
```
QUICKSTART.md                # Quick start instructions
SETUP.md                     # Detailed setup guide
LOCAL_DEVELOPMENT.md         # Complete local dev guide
install-backend.sh           # Linux/Mac installation script
install-backend.bat          # Windows installation script
```

### Updated Files
```
.env                         # Updated to point to localhost:3000
lib/auth-context.tsx         # Updated to use REST API instead of tRPC
```

## How to Run

### First Time Setup

**Step 1: Install Backend**
```bash
# Linux/Mac
bash install-backend.sh

# Windows
install-backend.bat
```

**Step 2: Setup Database**
```bash
mysql -u root -p
CREATE DATABASE tourist_map;
exit

mysql -u root -p tourist_map < backend/db/init.sql
```

### Every Time You Develop

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```
✅ Backend on http://localhost:3000

**Terminal 2 - Frontend:**
```bash
bunx expo start --web
```
✅ Frontend on http://localhost:8081

## Architecture Changes

### Before
```
Expo Dev Server (Port 8081)
  └── Hono + tRPC (TypeScript)
      └── MySQL Database
```
- Backend integrated with Expo
- Used tRPC procedures
- Complex TypeScript setup

### After
```
Express.js Server (Port 3000)          Expo Dev Server (Port 8081)
    └── MySQL Database                      └── React Native Web
                                                └── Calls REST API →
```
- Separate servers
- Simple REST endpoints
- Backend in JavaScript
- Frontend in TypeScript

## API Changes

### Before (tRPC)
```typescript
import { trpc } from '@/lib/trpc';

const loginMutation = trpc.auth.login.useMutation();
await loginMutation.mutateAsync({ email, password });
```

### After (REST)
```typescript
import { api } from '@/lib/api-client';

const response = await api.auth.login({ email, password });
```

## Testing Checklist

- [ ] Backend starts successfully on port 3000
- [ ] Frontend starts successfully on port 8081
- [ ] Can access http://localhost:3000 and see `{"status":"ok"}`
- [ ] Can access http://localhost:8081 and see the app
- [ ] Can register a new user
- [ ] Can login with registered user
- [ ] Can add favorites
- [ ] Can mark attractions as visited
- [ ] Can add reviews

## Common Commands

### Backend
```bash
cd server

# Install dependencies
npm install

# Start development server (auto-reload)
npm run dev

# Start production server
npm start
```

### Frontend
```bash
# From root directory

# Web only
bunx expo start --web

# All platforms
bunx expo start

# Clear cache
bunx expo start --clear
```

### Database
```bash
# Login to MySQL
mysql -u root -p

# Show databases
SHOW DATABASES;

# Use database
USE tourist_map;

# Show tables
SHOW TABLES;

# Show users
SELECT * FROM users;
```

## Configuration

### Frontend: `.env`
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

All REST endpoints are in `server/index.js`:

### Public
- `GET /` - Health check

### Authentication
- `POST /api/auth/register` - Register
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get user (protected)

### Features (All Protected)
- `POST /api/favorites/add`
- `POST /api/favorites/remove`
- `GET /api/favorites/list`
- `POST /api/visited/add`
- `GET /api/visited/list`
- `POST /api/reviews/add`
- `GET /api/reviews/list/:attractionId` (public)

### Verification (All Protected)
- `POST /api/verification/send-email-code`
- `POST /api/verification/send-phone-code`
- `POST /api/verification/verify-email`
- `POST /api/verification/verify-phone`

## File Locations

| Purpose | Old Location | New Location |
|---------|-------------|--------------|
| Backend Server | `backend/hono.ts` | `server/index.js` |
| API Client | `lib/trpc.ts` | `lib/api-client.ts` |
| Auth Context | Uses tRPC | Uses REST API |
| Backend Config | `.env` | `server/.env` |
| API Routes | `backend/trpc/routes/` | `server/index.js` |

## What's Deprecated

The following files still exist but are no longer used:
- `backend/` folder (old Hono + tRPC backend)
- `lib/trpc.ts` (old tRPC client)
- `app/api+api.ts` (old API route handler)

You can keep them for reference or delete them.

## Benefits of This Setup

✅ **Easier to Test**: Test backend and frontend independently
✅ **Simpler Code**: JavaScript backend is easier to understand
✅ **Standard REST**: No need to learn tRPC
✅ **Better Debugging**: Separate console logs
✅ **More Flexible**: Can deploy backend and frontend separately
✅ **Familiar**: Standard Express.js patterns

## Need Help?

- **Quick Start**: See [QUICKSTART.md](QUICKSTART.md)
- **Detailed Setup**: See [SETUP.md](SETUP.md)
- **Local Development**: See [LOCAL_DEVELOPMENT.md](LOCAL_DEVELOPMENT.md)
- **Backend Code**: Check `server/index.js`
- **Frontend API**: Check `lib/api-client.ts`

## Verification

Test everything works:

```bash
# 1. Backend health check
curl http://localhost:3000

# 2. Register test user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","name":"Test"}'

# 3. Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'

# 4. Open frontend
open http://localhost:8081
```

All done! 🎉
