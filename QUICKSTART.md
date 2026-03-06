# ⚡ Quick Start Guide

Get GovIntel AI running in 5 minutes!

## Prerequisites
- Node.js (v18+)
- MongoDB (local or Atlas)
- OpenAI API Key

## 🚀 Fast Setup

### 1. Backend
```bash
cd backend
npm install
```

Create `backend/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/govintel
JWT_SECRET=your-secret-key-here
OPENAI_API_KEY=sk-your-openai-key-here
NODE_ENV=development
```

Start backend:
```bash
npm start
```
✅ Backend running on http://localhost:5000

### 2. Frontend
Open new terminal:
```bash
cd frontend
npm install
```

Create `frontend/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

Start frontend:
```bash
npm run dev
```
✅ Frontend running on http://localhost:5173

### 3. Access Application
1. Open browser: http://localhost:5173
2. Click "Register" to create account
3. Use the application!

## 📝 Demo Credentials (if seeded)
- Email: admin@govintel.gov.in
- Password: admin123

## 🔗 Key URLs
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api
- API Health: http://localhost:5000/health

## ⚠️ Common Issues

**MongoDB not connecting?**
```bash
# Start MongoDB
net start MongoDB  # Windows
sudo systemctl start mongod  # Linux
```

**Port already in use?**
- Change `PORT` in backend/.env to 5001
- Change port in `VITE_API_URL` to match

**OpenAI errors?**
- Verify API key at https://platform.openai.com/api-keys
- Check you have credits

## 📚 Full Documentation
See [SETUP.md](SETUP.md) for detailed setup guide

---

**That's it!** You're ready to explore GovIntel AI! 🎉
