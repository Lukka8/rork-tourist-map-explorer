# Quick Start Guide

## 🚀 Running Backend and Frontend Separately

### Step 1: Install Backend Dependencies

Open a terminal and run:

```bash
cd server
npm install
```

### Step 2: Start Backend Server (Port 3000)

While in the `server` directory:

```bash
npm start
```

Or for development with auto-reload:

```bash
npm run dev
```

**✅ Backend is now running on http://localhost:3000**

### Step 3: Start Frontend (Separate Terminal)

Open a **NEW terminal window/tab** and navigate to the root directory:

```bash
# For web only
bunx expo start --web

# Or for all platforms
bunx expo start
```

**✅ Frontend web is now running on http://localhost:8081**

## 📝 Summary

You should have **2 terminals running**:

**Terminal 1 - Backend:**
```
server/
└── npm run dev (or npm start)
    → Running on http://localhost:3000
```

**Terminal 2 - Frontend:**
```
root/
└── bunx expo start --web
    → Running on http://localhost:8081
```

## ✅ Verify Everything Works

1. **Backend Health Check:**
   - Open http://localhost:3000 in browser
   - Should see: `{"status":"ok","message":"API is running"}`

2. **Frontend:**
   - Open http://localhost:8081 in browser
   - Should load your React Native web app

3. **Test Communication:**
   - Try registering/logging in from the frontend
   - Check terminal logs for API requests

## 🛠️ Troubleshooting

### Backend won't start
- Check if MySQL is running
- Verify database exists: `tourist_map`
- Check `server/.env` for correct DB credentials

### Frontend can't connect to backend
- Make sure `.env` in root has: `EXPO_PUBLIC_RORK_API_BASE_URL=http://localhost:3000`
- Restart both servers after changing `.env`
- Check browser console for errors

### Port already in use
- **Backend:** Change `PORT` in `server/.env`
- **Frontend:** Add `--port 8082` to expo start command

## 📱 Testing on Mobile Device

1. Both your computer and mobile device must be on the same WiFi network

2. Find your computer's IP address:
   - **Mac/Linux:** Run `ifconfig | grep "inet "`
   - **Windows:** Run `ipconfig`
   - Look for something like `192.168.1.XXX`

3. Update `.env` in root directory:
   ```env
   EXPO_PUBLIC_RORK_API_BASE_URL=http://192.168.1.XXX:3000
   ```
   (Replace XXX with your actual IP)

4. Restart both servers

5. Scan QR code from Expo to open on mobile

## 🎯 Next Steps

- See `SETUP.md` for detailed setup instructions
- Check `server/` folder for backend API documentation
- Database schema is in `backend/db/init.sql`
