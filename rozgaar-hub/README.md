# RozgaarHub - Connect Employers & Workers

## 🚀 Overview
RozgaarHub is a production-ready job marketplace platform designed specifically for India's gig economy. It connects blue-collar workers with employers, featuring bilingual support (English + Hindi), real-time features, and gamification.

## ✨ Features

### For Workers
- 🎯 Browse verified jobs with advanced filters
- 📅 Interactive calendar for job scheduling
- 🔥 Streak system with achievement badges (Bronze/Silver/Gold)
- 💰 Earnings tracker and payment management
- 👥 Team formation and collaboration
- ⭐ Rating and review system
- 📱 Mobile-first responsive design

### For Employers
- 📝 Post jobs instantly
- 🔍 Search and hire verified workers
- 📊 Project management dashboard
- 💳 Transparent payment tracking
- 📈 Analytics and insights

### Core Features
- 🌐 Bilingual support (English + हिंदी)
- 🔐 Secure JWT authentication
- 🎨 Beautiful Indian-themed design
- ⚡ Lightning-fast performance
- 🌙 Dark mode support
- 📲 PWA-ready for mobile installation

## 🛠️ Tech Stack

### Frontend
- React 18 + TypeScript
- Vite (Build Tool)
- Tailwind CSS + Shadcn/ui
- Zustand (State Management)
- React Router v6
- Framer Motion (Animations)
- Axios (API Client)

### Backend
- Node.js + Express.js
- MongoDB Atlas (Cloud Database)
- JWT Authentication
- Bcrypt (Password Hashing)
- Mongoose (ODM)

## 📦 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- Git

### Installation

1. **Clone the repository**
```bash
git clone <YOUR_REPO_URL>
cd rozgaar-hub
```

2. **Install dependencies**
```bash
# Frontend
npm install

# Backend
cd backend
npm install
cd ..
```

3. **Configure environment variables**

Create `backend/.env`:
```env
PORT=4000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:8080
NODE_ENV=development
```

Create `.env` in root:
```env
VITE_API_URL=http://localhost:4000/api
```

4. **Start the servers**

Terminal 1 (Backend):
```bash
cd backend
npm run dev
```

Terminal 2 (Frontend):
```bash
npm run dev
```

5. **Open the app**
```
http://localhost:8080
```

## 📖 Detailed Setup Guide

For detailed setup instructions for collaborators, see [SETUP.md](./SETUP.md)

## 🎯 Usage Flow

1. **Landing Page**: User selects Worker or Employer role
2. **Signup**: Enter details and preferred language
3. **Role Selection**: Confirm role choice
4. **Onboarding**: Complete profile with skills/business info
5. **Dashboard**: Access role-specific features
   - Workers: Browse jobs, manage calendar, track earnings
   - Employers: Post jobs, hire workers, manage projects

## 🔒 Authentication

- JWT-based authentication
- Secure password hashing with bcrypt
- Role-based access control (Worker/Employer)
- Protected API routes

## 📊 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile

### Worker Endpoints
- `GET /api/worker/jobs` - Browse jobs with filters
- `POST /api/worker/apply/:jobId` - Apply to job
- `GET /api/worker/applications` - Get my applications
- `GET /api/worker/calendar` - Get calendar events
- `GET /api/worker/payments` - Get payment history

### Employer Endpoints
- `POST /api/employer/jobs` - Create job posting
- `GET /api/employer/jobs` - Get my jobs
- `GET /api/employer/workers` - Search workers
- `GET /api/employer/applications/:jobId` - Get job applications
- `PUT /api/employer/applications/:id` - Accept/reject application
- `POST /api/employer/payments` - Create payment record

## 🗂️ Project Structure

```
rozgaar-hub/
├── backend/                 # Backend API
│   ├── src/
│   │   ├── models/         # Database models
│   │   ├── routes/         # API routes
│   │   ├── controllers/    # Business logic
│   │   ├── middleware/     # Auth middleware
│   │   └── server.js       # Entry point
│   └── package.json
│
├── src/                    # Frontend
│   ├── components/         # Reusable components
│   ├── pages/             # Page components
│   ├── lib/               # Utilities & API
│   ├── store/             # State management
│   └── types/             # TypeScript types
│
└── package.json
```

## 🎨 Design System

The platform uses a custom Indian-inspired design:
- **Primary (Saffron)**: `#FF9933` - Main actions
- **Secondary (Blue)**: `#000080` - Trust and authority
- **Accent (Green)**: `#138808` - Success and earnings

## 🚀 Deployment

### Frontend (Vercel/Netlify)
```bash
npm run build
# Deploy the 'dist' folder
```

### Backend (Heroku/Railway/Render)
```bash
cd backend
# Set environment variables on platform
# Deploy from backend folder
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

MIT License - feel free to use for your projects.

## 🙏 Acknowledgments

- Built with [Lovable](https://lovable.dev)
- UI components from [Shadcn/ui](https://ui.shadcn.com)
- Icons from [Lucide](https://lucide.dev)

## 📞 Support

For issues or questions:
- Create an issue in the repository
- Contact the project maintainer

---

**Made with ❤️ for India's Gig Economy**

## 🔗 Quick Links

- [Setup Guide for Collaborators](./SETUP.md)
- [API Documentation](./backend/README.md)
- [Frontend Documentation](./src/README.md)
