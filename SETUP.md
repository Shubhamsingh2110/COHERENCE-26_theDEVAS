# GovIntel AI - Complete Setup Guide

This guide will walk you through setting up the complete GovIntel AI platform from scratch.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.0.0 or higher)
  - Download: https://nodejs.org/
  - Verify: `node --version`

- **npm** (comes with Node.js)
  - Verify: `npm --version`

- **MongoDB** (v6.0 or higher)
  - Option 1: MongoDB Atlas (cloud) - https://www.mongodb.com/atlas
  - Option 2: Local MongoDB - https://www.mongodb.com/try/download/community
  - Verify: `mongod --version`

- **Git** (for version control)
  - Download: https://git-scm.com/
  - Verify: `git --version`

- **OpenAI API Key**
  - Sign up at: https://platform.openai.com/
  - Get your API key from: https://platform.openai.com/api-keys

## Step-by-Step Setup

### 1. Clone/Download the Project

```bash
# If using Git
git clone <repository-url>
cd COHERENCE-26_theDEVAS

# Or simply navigate to the project folder if downloaded as ZIP
cd COHERENCE-26_theDEVAS
```

### 2. Backend Setup

#### 2.1 Navigate to backend folder
```bash
cd backend
```

#### 2.2 Install dependencies
```bash
npm install
```

This will install all required packages:
- express: Web framework
- mongoose: MongoDB ODM
- jsonwebtoken: Authentication
- openai: AI integration
- bcryptjs: Password hashing
- express-validator: Input validation
- cors: Cross-origin resource sharing
- dotenv: Environment variables

#### 2.3 Configure environment variables

Create a `.env` file in the `backend` folder:

```bash
# On Windows
copy .env.example .env

# On Mac/Linux
cp .env.example .env
```

Edit the `.env` file with your configuration:

```env
PORT=5000
NODE_ENV=development

# MongoDB Configuration
# Option 1: Local MongoDB
MONGODB_URI=mongodb://localhost:27017/govintel

# Option 2: MongoDB Atlas (replace with your connection string)
# MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/govintel

# JWT Secret (change this to a random string)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# OpenAI API Key (get from https://platform.openai.com/api-keys)
OPENAI_API_KEY=sk-your-openai-api-key-here

# CORS (use your frontend URL)
CORS_ORIGIN=http://localhost:5173
```

#### 2.4 Start MongoDB (if using local installation)

```bash
# On Windows
net start MongoDB

# On Mac/Linux
sudo systemctl start mongod

# Or start manually
mongod --dbpath /path/to/data/directory
```

For MongoDB Atlas, skip this step - it's already running in the cloud.

#### 2.5 Start the backend server

```bash
npm start
```

You should see:
```
Server running on port 5000
MongoDB connected successfully
```

The backend API is now running at `http://localhost:5000`

### 3. Frontend Setup

Open a **new terminal window** (keep the backend running in the first one).

#### 3.1 Navigate to frontend folder
```bash
cd frontend
```

#### 3.2 Install dependencies
```bash
npm install
```

This will install all required packages:
- react: UI library
- vite: Build tool
- tailwindcss: Styling framework
- react-router-dom: Routing
- @tanstack/react-query: State management
- axios: HTTP client
- recharts: Charts/visualizations
- react-leaflet: Map visualization
- framer-motion: Animations
- lucide-react: Icons

#### 3.3 Configure environment variables

Create a `.env` file in the `frontend` folder:

```bash
# On Windows
copy .env.example .env

# On Mac/Linux
cp .env.example .env
```

The `.env` file should contain:

```env
VITE_API_URL=http://localhost:5000/api
```

#### 3.4 Start the development server

```bash
npm run dev
```

You should see:
```
  VITE v5.0.8  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

The frontend is now running at `http://localhost:5173`

### 4. Access the Application

1. Open your browser and navigate to `http://localhost:5173`

2. You'll see the login page. Click "Register" to create a new account.

3. Fill in the registration form:
   - **Name**: Your full name
   - **Email**: Valid email address
   - **Password**: At least 6 characters
   - **Role**: Select "Admin", "Analyst", or "Viewer"

4. After registration, you'll be automatically logged in and redirected to the dashboard.

### 5. Seed Demo Data (Optional but Recommended)

To populate the database with realistic government budget data for testing:

#### Option 1: Using the Data Generator Service

1. Open the backend terminal
2. Create a seed script or use Node.js REPL:

```bash
node
```

Then in the Node.js REPL:

```javascript
const mongoose = require('mongoose');
require('dotenv').config();
const { generateDemoData } = require('./services/dataGenerator');

mongoose.connect(process.env.MONGODB_URI)
  .then(() => generateDemoData())
  .then(() => {
    console.log('Demo data generated successfully!');
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
```

#### Option 2: Manual Creation

- Use the application's UI to create:
  - Departments (Ministry of Health, Education, etc.)
  - Budgets (allocations for different schemes)
  - Transactions (payments and expenses)

### 6. Verify Everything is Working

Test the following features:

#### ✅ Authentication
- [ ] Register a new account
- [ ] Login with credentials
- [ ] View profile
- [ ] Logout

#### ✅ Dashboard
- [ ] View KPI cards (allocated, spent, available, anomalies)
- [ ] See spending trends chart
- [ ] Check budget utilization circle
- [ ] View recent transactions

#### ✅ Budget Flow
- [ ] View all active budgets
- [ ] See allocation → spending → available flow
- [ ] Check utilization progress bars

#### ✅ Analytics
- [ ] View department comparison charts
- [ ] See spending trends over time
- [ ] Check utilization rates
- [ ] Review fund lapse predictions

#### ✅ Anomaly Detection
- [ ] View detected anomalies
- [ ] Filter by status
- [ ] Search anomalies
- [ ] Mark as resolved

#### ✅ Geospatial View
- [ ] See district map with markers
- [ ] Filter by state
- [ ] Click markers to view details
- [ ] Check utilization heat map

#### ✅ AI Assistant
- [ ] Send a message to AI
- [ ] Ask about budget status
- [ ] Request department analysis
- [ ] Get AI insights

#### ✅ Reports
- [ ] Select report type
- [ ] Generate report with AI
- [ ] View generated report
- [ ] Download report

## Common Issues & Troubleshooting

### Issue: MongoDB Connection Failed

**Error**: `MongooseServerSelectionError: connect ECONNREFUSED`

**Solution**:
1. Ensure MongoDB is running:
   ```bash
   # Check MongoDB status
   # Windows:
   sc query MongoDB
   
   # Mac/Linux:
   sudo systemctl status mongod
   ```

2. Verify your `MONGODB_URI` in `.env` is correct

3. If using MongoDB Atlas, check:
   - Your IP is whitelisted
   - Username/password are correct
   - Cluster is running

### Issue: OpenAI API Errors

**Error**: `401 Unauthorized` or `Invalid API key`

**Solution**:
1. Verify your OpenAI API key in `backend/.env`
2. Ensure you have credits in your OpenAI account
3. Check the key is active at https://platform.openai.com/api-keys

### Issue: Port Already in Use

**Error**: `Port 5000 is already in use` or `Port 5173 is already in use`

**Solution**:

For Windows:
```powershell
# Find process using port
netstat -ano | findstr :5000
# Kill the process
taskkill /PID <process-id> /F
```

For Mac/Linux:
```bash
# Find and kill process
lsof -ti:5000 | xargs kill -9
```

Or change the port in your `.env` files.

### Issue: Frontend Can't Connect to Backend

**Error**: `Network Error` or `ERR_CONNECTION_REFUSED`

**Solution**:
1. Ensure backend is running (`npm start` in backend folder)
2. Check backend is on port 5000: `http://localhost:5000`
3. Verify `VITE_API_URL` in `frontend/.env` is `http://localhost:5000/api`
4. Clear browser cache and reload

### Issue: npm install Fails

**Error**: Various npm errors during installation

**Solution**:
1. Clear npm cache:
   ```bash
   npm cache clean --force
   ```

2. Delete `node_modules` and `package-lock.json`:
   ```bash
   rm -rf node_modules package-lock.json
   # Or on Windows:
   rmdir /s node_modules
   del package-lock.json
   ```

3. Install again:
   ```bash
   npm install
   ```

### Issue: Leaflet Map Not Showing

**Error**: Map container is blank or shows errors

**Solution**:
1. Ensure Leaflet CSS is imported in the component
2. Check the map container has a defined height
3. Verify internet connection (tiles load from OpenStreetMap)

## Production Deployment

For deploying to production:

### Backend Deployment (e.g., Heroku, Railway, Render)

1. Set environment variables in your hosting platform
2. Use MongoDB Atlas for database (not local)
3. Set `NODE_ENV=production`
4. Update `CORS_ORIGIN` to your frontend URL

### Frontend Deployment (e.g., Vercel, Netlify)

1. Update `VITE_API_URL` to your backend URL
2. Build the project:
   ```bash
   npm run build
   ```
3. Deploy the `dist` folder

## Support

If you encounter issues not covered here:

1. Check the backend logs in the terminal
2. Check browser console for frontend errors (F12 → Console)
3. Verify all environment variables are set correctly
4. Ensure all dependencies are installed (`npm install`)

## Next Steps

Once everything is set up:

1. Explore all features of the application
2. Create sample budgets and transactions
3. Test the anomaly detection
4. Try the AI assistant with different queries
5. Generate reports
6. Customize the code for your needs

---

**Congratulations!** 🎉 You've successfully set up GovIntel AI!

For more information, see the main [README.md](README.md)