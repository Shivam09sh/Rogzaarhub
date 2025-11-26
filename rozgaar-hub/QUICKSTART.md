# 🚀 Quick Start for Collaborators

## One-Command Setup (Recommended)

### For Mac/Linux:
```bash
./setup.sh
```

### For Windows:
```bash
setup.bat
```

That's it! The script will:
- ✅ Install all dependencies (frontend + backend)
- ✅ **Automatically create `.env` files with database credentials**
- ✅ Configure everything for you

---

## What Happens Automatically

The `setup.sh` script does ALL of this for you:

1. **Checks** if Node.js is installed
2. **Installs** frontend dependencies (`npm install`)
3. **Installs** backend dependencies (`cd backend && npm install`)
4. **Creates** `backend/.env` file (copies from `backend/.env.example`)
5. **Creates** `.env` file (copies from `.env.example`)
6. **Configures** database connection automatically

**You don't need to edit ANY files!** Everything is pre-configured.

---

## Complete Setup (Copy & Paste)

```bash
# 1. Clone the repository
git clone <REPO_URL>
cd rozgaar-hub

# 2. Run setup script (does everything automatically)
./setup.sh

# 3. Start backend server (Terminal 1)
cd backend
npm run dev

# 4. Start frontend server (Terminal 2 - open new terminal)
npm run dev

# 5. Open in browser
# http://localhost:8080
```

---

## What You'll See

When you run `./setup.sh`, you'll see:

```
🚀 RozgaarHub Setup Script
==========================

✅ Node.js version: v18.x.x
✅ npm version: 9.x.x

📦 Installing frontend dependencies...
✅ Frontend dependencies installed

📦 Installing backend dependencies...
✅ Backend dependencies installed

🔍 Checking environment files...
⚠️  backend/.env not found!
📋 Copying backend/.env.example to backend/.env...
✅ Created backend/.env from example file
✅ Database credentials are already configured!

⚠️  .env not found!
📋 Copying .env.example to .env...
✅ Created .env from example file

✅ Setup Complete!

📝 Next Steps:
1. Environment files are configured with shared database
2. Open TWO terminal windows:

   Terminal 1 (Backend):
   $ cd backend
   $ npm run dev

   Terminal 2 (Frontend):
   $ npm run dev

3. Open http://localhost:8080 in your browser

🎉 You're all set! Everyone shares the same database.
```

---

## No Manual Configuration Needed!

❌ **You DON'T need to:**
- Create `.env` files manually
- Edit any configuration
- Set up MongoDB account
- Copy/paste database credentials

✅ **The script does it ALL automatically!**

---

## Troubleshooting

### "Permission denied" when running setup.sh

```bash
chmod +x setup.sh
./setup.sh
```

### "Node.js is not installed"

Install Node.js from: https://nodejs.org/
(Download the LTS version)

### "Port already in use"

```bash
# Kill port 4000 (backend)
lsof -ti:4000 | xargs kill -9

# Kill port 8080 (frontend)
lsof -ti:8080 | xargs kill -9
```

---

## That's It!

The setup script handles everything. Just run it and start coding! 🎉

For detailed documentation, see [SETUP.md](./SETUP.md)
