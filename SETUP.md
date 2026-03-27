# Quick Setup Guide

## 🚀 Get This Project Running in 5 Minutes

### Step 1: Install Dependencies
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### Step 2: Set Up Environment Variables

**⚠️ Important**: `.env` files are excluded from git for security. Create them manually:

```bash
# Backend - Create .env file (copy from .env.example if available)
cd backend
# Create .env file and add your credentials:
# GMAIL_USER=your-email@gmail.com
# GMAIL_APP_PASSWORD=your-app-password
# JWT_SECRET=your-secret-key
# FRONTEND_URL=http://localhost:5173/
# GOOGLE_CLIENT_ID=your-google-client-id
# GOOGLE_CLIENT_SECRET=your-google-client-secret

# Frontend - Create .env file
cd ../frontend
# Create .env file and add:
# VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

### Step 3: Start the Servers

**Terminal 1 (Backend):**
```bash
cd backend
node server.js
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```

### Step 4: Open Application
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

## ⚠️ Important Notes

1. **Database**: The project uses Neon PostgreSQL (already configured)
2. **Google OAuth**: You need your own Google credentials for Sign-In to work
3. **Email**: You need Gmail app password for password reset emails

## 🔑 Getting Google Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project or select existing
3. Enable "Google+ API" in APIs & Services
4. Create OAuth 2.0 Client ID credentials
5. Add `http://localhost:5173` to authorized JavaScript origins
6. **Add ALL these redirect URIs** to authorized redirect URIs:
   - `http://localhost:5173` (no slash)
   - `http://localhost:5173/` (with slash)
   - `http://localhost:5173/auth`
   - `http://localhost:5173/oauth`
   - `http://localhost:5173/oauth/callback`
7. Copy Client ID and Client Secret to your .env files

**Note**: Adding multiple redirect URIs ensures compatibility with the `@react-oauth/google` library's automatic redirect handling.

## 📧 Setting Up Gmail for Emails

1. Enable 2-Factor Authentication on your Gmail
2. Go to Google Account > Security > App passwords
3. Generate new app password for "Mail"
4. Use this password (not your regular Gmail password) in backend/.env

## 🆘 Common Issues

- **CORS errors**: Make sure FRONTEND_URL in backend/.env matches your frontend URL
- **Google OAuth fails**: Check if redirect URIs are configured correctly in Google Console
- **Database errors**: Neon database might be sleeping, just retry the operation
- **Email not sending**: Verify Gmail app password and 2FA is enabled

---

**Need help?** Check the full README.md for detailed instructions!