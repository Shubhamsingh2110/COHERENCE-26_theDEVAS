# GovIntel AI - National Budget Flow Intelligence & Leakage Detection Platform

![GovIntel AI](https://img.shields.io/badge/Status-Hackathon%20Ready-brightgreen)
![Tech Stack](https://img.shields.io/badge/Stack-MERN-blue)
![AI Powered](https://img.shields.io/badge/AI-OpenAI%20GPT--4-purple)

An advanced AI-powered platform for tracking government budget allocations, detecting financial anomalies, predicting fund lapse risks, and providing intelligent insights for budget management.

## 🌟 Key Features

### 📊 Budget Intelligence
- **Real-time Budget Tracking**: Monitor budget allocations, spending, and availability across departments and districts
- **Flow Visualization**: Track fund flow from central government to departments, districts, and schemes
- **Utilization Analytics**: Comprehensive visualization of budget utilization rates and trends

### 🤖 AI-Powered Analysis
- **Anomaly Detection**: Statistical algorithms detect suspicious transactions, duplicates, velocity patterns, and round-figure amounts
- **Predictive Analytics**: AI predicts fund lapse risks, spending forecasts, and budget health scores
- **AI Assistant**: ChatGPT-powered assistant for natural language queries and budget insights
- **Automated Reports**: Generate comprehensive executive summaries and detailed analysis reports

### 🗺️ Geospatial Visualization
- **Interactive Map**: District-wise budget allocation visualization on OpenStreetMap
- **Heat Maps**: Color-coded circles based on budget utilization rates
- **Population Analysis**: Budget allocation per capita analysis

### 📈 Advanced Analytics
- **Department Comparison**: Side-by-side analysis of departmental budgets
- **Spending Trends**: Monthly and quarterly spending pattern analysis
- **Risk Scoring**: Automated budget health and risk assessment
- **Fund Lapse Prediction**: Early warning system for potential budget lapses

## 🛠️ Tech Stack

### Backend
- **Node.js** (v18+) - Runtime environment
- **Express.js** (4.18.2) - Web framework
- **MongoDB** (Mongoose 8.0.3) - Database
- **JWT** (jsonwebtoken 9.0.2) - Authentication
- **OpenAI API** (4.20.1) - AI integration
- **bcryptjs** (2.4.3) - Password hashing
- **express-validator** (7.0.1) - Input validation

### Frontend
- **React** (18.2.0) - UI library
- **Vite** (5.0.8) - Build tool & dev server
- **Tailwind CSS** (3.3.6) - Styling
- **React Router** (6.20.1) - Navigation
- **TanStack Query** (5.13.4) - State management
- **Recharts** (2.10.3) - Data visualization
- **React Leaflet** (4.2.1) - Map visualization
- **Framer Motion** (10.16.16) - Animations
- **Lucide React** (0.294.0) - Icons

## 📁 Project Structure

```
COHERENCE-26_theDEVAS/
├── backend/
│   ├── config/
│   │   ├── database.js          # MongoDB connection
│   │   └── openai.js            # OpenAI client setup
│   ├── controllers/
│   │   ├── authController.js    # Authentication logic
│   │   ├── budgetController.js  # Budget CRUD operations
│   │   ├── transactionController.js
│   │   ├── analyticsController.js
│   │   ├── anomalyController.js
│   │   ├── aiController.js      # AI chat & insights
│   │   └── districtController.js
│   ├── middleware/
│   │   ├── auth.js              # JWT verification
│   │   ├── errorHandler.js      # Global error handling
│   │   └── validator.js         # Input validation
│   ├── models/
│   │   ├── User.js              # User schema
│   │   ├── Department.js
│   │   ├── Budget.js
│   │   ├── Transaction.js
│   │   ├── Anomaly.js
│   │   └── District.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── budget.js
│   │   ├── transactions.js
│   │   ├── analytics.js
│   │   ├── anomalies.js
│   │   ├── ai.js
│   │   └── districts.js
│   ├── services/
│   │   ├── anomalyDetector.js   # Statistical anomaly detection
│   │   ├── aiService.js         # OpenAI integration
│   │   ├── predictiveAnalytics.js
│   │   └── dataGenerator.js     # Demo data seeding
│   ├── utils/
│   │   ├── constants.js         # Application enums
│   │   └── helpers.js           # Utility functions
│   ├── server.js                # Entry point
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── common/
    │   │   │   ├── LoadingSpinner.jsx
    │   │   │   └── SearchBar.jsx
    │   │   └── layout/
    │   │       ├── Layout.jsx
    │   │       ├── Sidebar.jsx
    │   │       └── Navbar.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx  # Authentication state
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Dashboard.jsx    # Main dashboard
    │   │   ├── Analytics.jsx    # Advanced analytics
    │   │   ├── AnomalyDetection.jsx
    │   │   ├── BudgetFlow.jsx   # Budget flow tracking
    │   │   ├── GeospatialView.jsx # Map visualization
    │   │   ├── AIAssistant.jsx  # AI chat interface
    │   │   └── Reports.jsx      # Report generation
    │   ├── services/
    │   │   └── api.js           # API client
    │   ├── utils/
    │   │   ├── formatters.js    # Data formatting
    │   │   └── constants.js
    │   ├── App.jsx              # Route config
    │   ├── main.jsx             # Entry point
    │   └── index.css
    ├── vite.config.js
    ├── tailwind.config.js
    └── package.json
```

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18 or higher)
- **MongoDB** (local or Atlas)
- **OpenAI API Key** (for AI features)

### Backend Setup

1. **Navigate to backend folder**
```bash
cd backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Create `.env` file**
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/govintel
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
OPENAI_API_KEY=your-openai-api-key
NODE_ENV=development
```

4. **Start the server**
```bash
npm start
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend folder**
```bash
cd frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Create `.env` file**
```env
VITE_API_URL=http://localhost:5000/api
```

4. **Start development server**
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

### Initial Setup & Demo Data

1. **Access the application** at `http://localhost:5173`

2. **Register a new account** or use demo credentials:
   - Email: `admin@govintel.gov.in`
   - Password: `admin123`

3. **Seed demo data** (optional - for testing):
   - The `dataGenerator.js` service can populate the database with realistic government budget data
   - Run seed script: `npm run seed` (if configured)

## 📊 API Documentation

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile

### Budget Management
- `GET /api/budgets` - Get all budgets (with filters)
- `POST /api/budgets` - Create new budget
- `GET /api/budgets/:id` - Get budget by ID
- `PUT /api/budgets/:id` - Update budget
- `DELETE /api/budgets/:id` - Delete budget
- `GET /api/budgets/:id/flow` - Track budget flow

### Transactions
- `GET /api/transactions` - Get all transactions
- `POST /api/transactions` - Create transaction
- `GET /api/transactions/:id` - Get transaction details
- `PUT /api/transactions/:id/flag` - Flag suspicious transaction

### Analytics
- `GET /api/analytics/overview` - Dashboard overview stats
- `GET /api/analytics/trends` - Spending trends
- `GET /api/analytics/predictions` - Fund lapse predictions
- `GET /api/analytics/utilization` - Utilization rates

### Anomaly Detection
- `GET /api/anomalies` - Get detected anomalies
- `POST /api/anomalies/detect` - Run anomaly detection
- `PUT /api/anomalies/:id/resolve` - Mark anomaly as resolved

### AI Services
- `POST /api/ai/chat` - Chat with AI assistant
- `POST /api/ai/analyze` - Analyze budget data
- `POST /api/ai/insights` - Get AI insights
- `POST /api/ai/report` - Generate AI report

### Geospatial
- `GET /api/districts` - Get all districts
- `GET /api/districts/map` - Get map visualization data

## 🎯 Key Differentiators (Hackathon Winning Features)

### 1. **Advanced AI Integration**
- Real-time anomaly detection using statistical algorithms (Z-scores, velocity analysis)
- ChatGPT-4 powered intelligent assistant for natural language queries
- Automated report generation with AI insights
- Predictive analytics for proactive budget management

### 2. **Comprehensive Visualization**
- Interactive geospatial maps with heat mapping
- Multi-chart analytics dashboard (Line, Bar, Pie, Area charts)
- Real-time budget flow tracking
- Department-wise comparison views

### 3. **Production-Ready Architecture**
- MVC pattern with clear separation of concerns
- RESTful API design with proper error handling
- JWT-based authentication and role-based access
- Scalable service layer architecture
- Input validation and sanitization

### 4. **User Experience**
- Clean, modern UI with Tailwind CSS
- Responsive design for all screen sizes
- Smooth animations with Framer Motion
- Loading states and error handling
- Search and filter capabilities

### 5. **Real-World Application**
- Addresses genuine government budget management challenges
- Fraud detection and prevention capabilities
- Fund lapse risk mitigation
- Transparency and accountability features

## 🔒 Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Authentication**: Secure token-based auth
- **Input Validation**: express-validator for all inputs
- **CORS Configuration**: Controlled cross-origin access
- **Environment Variables**: Sensitive data protection
- **MongoDB Injection Prevention**: Mongoose sanitization

## 📈 Future Enhancements

- [ ] Role-based access control (Admin, Auditor, Viewer)
- [ ] Email notifications for anomalies
- [ ] Real-time alerts with WebSockets
- [ ] Mobile app (React Native)
- [ ] Export reports to PDF/Excel
- [ ] Multi-language support
- [ ] Advanced ML models for anomaly detection
- [ ] Blockchain integration for transparency
- [ ] Integration with actual government APIs

## 🤝 Contributing

This is a hackathon project. For improvements or suggestions:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📝 License

MIT License - Feel free to use this project for learning and development.

## 👥 Team: theDEVAS

Built with ❤️ for COHERENCE-26 Hackathon

---

## 🎓 Learning Resources

### Technologies Used
- [Node.js Documentation](https://nodejs.org/docs)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [MongoDB Manual](https://docs.mongodb.com/manual/)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [OpenAI API Reference](https://platform.openai.com/docs)
- [Recharts Documentation](https://recharts.org/)
- [React Leaflet](https://react-leaflet.js.org/)

---

**Note**: This project was built for educational purposes and hackathon demonstration. For production deployment, additional security hardening, testing, and optimization would be required.
