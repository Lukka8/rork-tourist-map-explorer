# 🚀 START HERE

Your app now runs with **separate backend and frontend** on different ports!

## Quick Commands

### First Time Only

**1. Install Backend:**
```bash
# Linux/Mac users
bash install-backend.sh

# Windows users
install-backend.bat
```

**2. Setup Database:**
```bash
mysql -u root -p
CREATE DATABASE tourist_map;
exit

mysql -u root -p tourist_map < backend/db/init.sql
```

### Every Time You Code

Open **2 terminals**:

**Terminal 1 (Backend):**
```bash
cd server
npm run dev
```
✅ Backend: http://localhost:3000

**Terminal 2 (Frontend):**
```bash
bunx expo start --web
```
✅ Frontend: http://localhost:8081

## That's It! 🎉

Open http://localhost:8081 in your browser and start coding!

---

## Full Documentation

- 📖 [QUICKSTART.md](QUICKSTART.md) - Quick start guide
- 📚 [SETUP.md](SETUP.md) - Complete setup instructions  
- 💻 [LOCAL_DEVELOPMENT.md](LOCAL_DEVELOPMENT.md) - Development guide
- 📝 [SUMMARY.md](SUMMARY.md) - What changed

## Troubleshooting

### Backend won't start?
- Check MySQL is running: `mysql -u root -p`
- Check credentials in `server/.env`

### Frontend can't connect?
- Make sure backend is running on port 3000
- Check `.env` has: `EXPO_PUBLIC_RORK_API_BASE_URL=http://localhost:3000`

### Port already in use?
- Backend: Change `PORT` in `server/.env`
- Frontend: Use `bunx expo start --web --port 8082`

---

**Need help?** Read the full documentation files above or check terminal logs.
