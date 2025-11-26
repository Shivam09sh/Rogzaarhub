# RozgaarHub - Setup Guide for Collaborators

## 📋 Prerequisites

Before starting, make sure you have:

1. **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
2. **Git** - [Download here](https://git-scm.com/)
3. **MongoDB Atlas Account** (Free) - [Sign up here](https://www.mongodb.com/cloud/atlas/register)
4. **Code Editor** (VS Code recommended) - [Download here](https://code.visualstudio.com/)

---

## 🚀 Quick Start Guide

### Step 1: Clone the Repository

```bash
# Clone the project
git clone <YOUR_REPOSITORY_URL>
cd rozgaar-hub
```

### Step 2: Install Frontend Dependencies

```bash
# Install frontend dependencies
npm install
```

### Step 3: Install Backend Dependencies

```bash
# Navigate to backend folder
cd backend

# Install backend dependencies
npm install

# Go back to root
cd ..
```

### Step 4: Get Database Connection (From Project Owner)

**IMPORTANT:** This project uses a **shared MongoDB database** hosted by the project owner.

**Ask the project owner for:**
- MongoDB connection string
- Database password

**You do NOT need to create your own MongoDB account!** Everyone will connect to the same centralized database.

### Step 5: Configure Environment Variables

#### Backend Environment (.env)

Create a file `backend/.env` with the following content.

**Copy this EXACTLY as shown:**

```env
PORT=4000
MONGODB_URI=mongodb+srv://swayamnarvekar3388_db_user:VO6WirJW2xyCVnNf@cluster0.vn6esnu.mongodb.net/rozgaarhub?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=rozgaarhub_jwt_secret_key_2024_secure_random_string
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:8080
NODE_ENV=development
```

**⚠️ IMPORTANT:** 
- Do NOT change the `MONGODB_URI` - this connects to the shared database
- Do NOT change the `JWT_SECRET` - everyone must use the same secret
- All team members will share the same database and can see each other's data

#### Frontend Environment (.env)

Create a file `.env` in the root folder with:

```env
VITE_API_URL=http://localhost:4000/api
```

### Step 6: Start the Servers

You need **TWO terminal windows**:

#### Terminal 1 - Backend Server
```bash
cd backend
npm run dev
```

You should see:
```
🚀 RozgaarHub Backend Server
📡 Running on port 4000
✅ MongoDB Connected
```

#### Terminal 2 - Frontend Server
```bash
# From root directory
npm run dev
```

You should see:
```
VITE v5.4.19  ready in XXX ms
➜  Local:   http://localhost:8080/
```

### Step 7: Open the Application

Open your browser and go to:
```
http://localhost:8080
```

---

## 🎯 Testing the Application

### Create a Worker Account
1. Click "Sign Up"
2. Fill in details:
   - Name: Your Name
   - Phone: +91 9876543210
   - Email: your.email@example.com
   - Password: test123
   - Role: **Worker**
   - Language: English
3. Click "Sign Up"
4. You'll be redirected to the onboarding page

### Create an Employer Account
1. Open a new incognito/private window
2. Go to http://localhost:8080/signup
3. Fill in details with role: **Employer**
4. Complete signup

### Test Login
1. Go to http://localhost:8080/login
2. Enter your email and password
3. You'll be redirected to your dashboard

---

## 📁 Project Structure

```
rozgaar-hub/
├── backend/                 # Backend API server
│   ├── src/
│   │   ├── models/         # Database schemas
│   │   ├── routes/         # API routes
│   │   ├── controllers/    # Business logic
│   │   ├── middleware/     # Auth middleware
│   │   ├── config/         # Database config
│   │   └── server.js       # Main server file
│   ├── .env                # Backend environment variables
│   └── package.json        # Backend dependencies
│
├── src/                    # Frontend React app
│   ├── components/         # UI components
│   ├── pages/             # Page components
│   ├── lib/               # Utilities & API
│   ├── store/             # State management
│   └── types/             # TypeScript types
│
├── .env                    # Frontend environment variables
├── package.json            # Frontend dependencies
└── README.md              # This file
```

---

## 🔧 Troubleshooting

### Backend won't start

**Error: "MongoDB connection failed"**
- Check your MongoDB connection string in `backend/.env`
- Verify your MongoDB Atlas IP whitelist (allow 0.0.0.0/0 for development)
- Check your database username and password

**Error: "Port 4000 already in use"**
```bash
# Kill the process using port 4000
# On Mac/Linux:
lsof -ti:4000 | xargs kill -9

# On Windows:
netstat -ano | findstr :4000
taskkill /PID <PID_NUMBER> /F
```

### Frontend won't start

**Error: "Port 8080 already in use"**
```bash
# Kill the process using port 8080
# On Mac/Linux:
lsof -ti:8080 | xargs kill -9

# On Windows:
netstat -ano | findstr :8080
taskkill /PID <PID_NUMBER> /F
```

**Error: "Cannot find module"**
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Login/Signup not working

1. Check browser console for errors (F12)
2. Verify backend is running on port 4000
3. Check `VITE_API_URL` in `.env` is correct
4. Clear browser cache and localStorage
5. Try in incognito/private mode

### Database issues

**Can't see data in MongoDB Atlas:**
1. Go to MongoDB Atlas dashboard
2. Click "Browse Collections"
3. Select `rozgaarhub` database
4. You should see collections: users, jobs, applications, etc.

---

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Worker Routes
- `GET /api/worker/jobs` - Browse jobs
- `POST /api/worker/apply/:jobId` - Apply to job
- `GET /api/worker/applications` - My applications
- `GET /api/worker/calendar` - My calendar
- `GET /api/worker/payments` - My payments

### Employer Routes
- `POST /api/employer/jobs` - Create job
- `GET /api/employer/jobs` - My jobs
- `GET /api/employer/workers` - Search workers
- `GET /api/employer/applications/:jobId` - Job applications
- `POST /api/employer/payments` - Create payment

---

## 💡 Development Tips

### Hot Reload
Both servers support hot reload:
- **Backend:** Changes auto-restart server (nodemon)
- **Frontend:** Changes auto-refresh browser (Vite HMR)

### Viewing Logs
- **Backend logs:** Check Terminal 1 (backend server)
- **Frontend logs:** Check browser console (F12)
- **Network requests:** Browser DevTools → Network tab

### Testing API with Postman
1. Download [Postman](https://www.postman.com/downloads/)
2. Import the API endpoints
3. Test endpoints at `http://localhost:4000/api`

### Database Management
Use [MongoDB Compass](https://www.mongodb.com/products/compass) to:
- View database collections
- Query data directly
- Monitor performance

---

## 🔐 Security Notes

**For Development:**
- The current setup is for development only
- JWT secret should be changed for production
- MongoDB should have proper IP whitelisting

**For Production:**
- Use environment-specific `.env` files
- Enable HTTPS
- Set up proper CORS origins
- Use strong JWT secrets
- Enable MongoDB authentication
- Set up proper logging and monitoring

---

## 📞 Getting Help

If you encounter issues:

1. **Check the logs** in both terminal windows
2. **Search the error** on Google/Stack Overflow
3. **Ask the project owner** for help
4. **Check MongoDB Atlas** dashboard for connection issues

---

## 🎉 You're All Set!

Once both servers are running, you can:
- ✅ Register as Worker or Employer
- ✅ Login to your dashboard
- ✅ Browse the application
- ✅ Test all features

**Happy Coding! 🚀**
