# Local Development Setup

This guide explains how to run the backend and frontend separately on localhost.

## Architecture

- **Backend**: Express.js server running on `http://localhost:3000`
- **Frontend**: React Native web running on `http://localhost:8081` (Expo default)

## Prerequisites

1. **Node.js** (v18 or higher)
2. **Bun** (for frontend) or npm
3. **MySQL** database running
4. **npm** (for backend)

## Setup Steps

### 1. Database Setup

Make sure MySQL is running and create the database:

```sql
CREATE DATABASE tourist_map;
```

Run the initialization script:

```bash
mysql -u root -p tourist_map < backend/db/init.sql
```

### 2. Backend Setup

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Start the backend server
npm run dev
```

The backend will run on `http://localhost:3000`

**Verify backend is running:**
Open http://localhost:3000 in browser - you should see:
```json
{"status":"ok","message":"API is running"}
```

### 3. Frontend Setup

In a **new terminal**, from the root directory:

```bash
# Install dependencies (if not already done)
bun install

# Start Expo web
bunx expo start --web
```

The frontend will run on `http://localhost:8081`

## Environment Configuration

### Backend (.env in `server/` folder)
```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=tourist_map
JWT_SECRET=your_jwt_secret_key_here
```

### Frontend (.env in root folder)
```env
EXPO_PUBLIC_RORK_API_BASE_URL=http://localhost:3000
```

## Testing the Setup

1. **Backend health check:**
   ```bash
   curl http://localhost:3000
   ```
   Should return: `{"status":"ok","message":"API is running"}`

2. **Test registration:**
   ```bash
   curl -X POST http://localhost:3000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"test123","name":"Test User"}'
   ```

3. **Open frontend:**
   Navigate to http://localhost:8081 in your browser

## Running Both Servers

You need **two terminal windows**:

**Terminal 1 (Backend):**
```bash
cd server
npm run dev
```

**Terminal 2 (Frontend):**
```bash
bunx expo start --web
```

## Troubleshooting

### Backend not connecting to database
- Check if MySQL is running: `mysql -u root -p`
- Verify database exists: `SHOW DATABASES;`
- Check credentials in `server/.env`

### Frontend can't reach backend
- Verify backend is running on port 3000
- Check `EXPO_PUBLIC_RORK_API_BASE_URL` in root `.env` file
- Look for CORS errors in browser console

### Port already in use
- Backend: Change `PORT` in `server/.env`
- Frontend: Use `bunx expo start --web --port 8082` (or any other port)

## Mobile Testing

For testing on mobile devices with localhost backend:

1. Find your computer's local IP address:
   - Mac/Linux: `ifconfig | grep "inet "`
   - Windows: `ipconfig`

2. Update `EXPO_PUBLIC_RORK_API_BASE_URL` to use your IP:
   ```env
   EXPO_PUBLIC_RORK_API_BASE_URL=http://192.168.1.XXX:3000
   ```

3. Make sure your mobile device is on the same network

4. Restart Expo and scan the QR code
