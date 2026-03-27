# Quick Setup Guide - VirtuFit3D Studio

Get the 3D Virtual Try-On System running locally in under 10 minutes.

## 📋 Prerequisites

Before starting, ensure you have:

- ✅ **Node.js 16+** and npm installed ([Download here](https://nodejs.org/))
- ✅ **PostgreSQL database** access (Neon recommended for quick setup)
- ✅ **Gmail account** with 2FA enabled
- ✅ **Google Cloud Console** account for OAuth

## 🚀 Step 1: Clone and Install

```bash
# Clone the repository
git clone <repository-url>
cd 3d-virtual-tryon-system

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

## 🔐 Step 2: Set Up Environment Variables

### Backend Environment (backend/.env)

Create a file named `.env` in the `backend/` directory:

```env
# Gmail Configuration
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx

# JWT Secret (use a long random string)
JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters-long

# Frontend URL
FRONTEND_URL=http://localhost:5173

# Google OAuth Credentials
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
```

### Frontend Environment (frontend/.env)

Create a file named `.env` in the `frontend/` directory:

```env
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

**Note**: Use the same Google Client ID in both files.

## 🗄️ Step 3: Configure Database

### Option A: Use Neon (Recommended - Free & Easy)

1. Go to [Neon](https://neon.tech/) and sign up
2. Create a new project
3. Copy the connection string
4. Update `backend/db.js`:
   ```javascript
   const pool = new Pool({
     connectionString: "your-neon-connection-string-here",
     ssl: { rejectUnauthorized: false },
   });
   ```

### Option B: Use Local PostgreSQL

1. Install PostgreSQL locally
2. Create a database: `createdb virtufit3d`
3. Update `backend/db.js`:
   ```javascript
   const pool = new Pool({
     connectionString:
       "postgresql://username:password@localhost:5432/virtufit3d",
   });
   ```

### Create Database Tables

Connect to your database and run:

```sql
-- Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  reset_token VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Avatars table
CREATE TABLE avatars (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  avatar_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🔑 Step 4: Set Up Google OAuth

### 1. Create Google Cloud Project

1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Enter project name (e.g., "VirtuFit3D") and click "Create"

### 2. Enable Google+ API

1. In the left sidebar, go to "APIs & Services" → "Library"
2. Search for "Google+ API"
3. Click on it and press "Enable"

### 3. Create OAuth 2.0 Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth 2.0 Client ID"
3. If prompted, configure the OAuth consent screen:
   - User Type: External (or Internal for Google Workspace)
   - App name: VirtuFit3D Studio
   - User support email: your email
   - Developer contact: your email
   - Save and continue through all steps

### 4. Configure OAuth Client

1. Application type: **Web application**
2. Name: VirtuFit3D OAuth Client
3. **Authorized JavaScript origins**:
   - Add: `http://localhost:5173`
4. **Authorized redirect URIs**:
   - Add: `http://localhost:5173`
   - Add: `http://localhost:5173/`
5. Click "Create"

### 5. Save Credentials

1. Copy the **Client ID**
2. Copy the **Client Secret**
3. Update both `.env` files with these values

## 📧 Step 5: Set Up Gmail for Password Reset

### 1. Enable 2-Factor Authentication

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable "2-Step Verification"

### 2. Generate App Password

1. Still in Security settings, scroll to "App passwords"
2. Click "App passwords"
3. Select app: "Mail"
4. Select device: "Other (Custom name)"
5. Enter: "VirtuFit3D"
6. Click "Generate"
7. Copy the 16-character password (format: `xxxx xxxx xxxx xxxx`)

### 3. Update Backend .env

```env
GMAIL_USER=your-actual-gmail@gmail.com
GMAIL_APP_PASSWORD=your-16-char-password-here
```

## ▶️ Step 6: Start the Application

### Terminal 1 - Backend Server

```bash
cd backend
node server.js
```

You should see:

```
Server running on port 3000
```

**Optional**: Use nodemon for auto-restart on code changes:

```bash
npm install -g nodemon
nodemon server.js
```

### Terminal 2 - Frontend Development Server

```bash
cd frontend
npm run dev
```

You should see:

```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

## 🎉 Step 7: Access the Application

1. Open your browser
2. Navigate to: `http://localhost:5173`
3. You should see the login/signup page

### Test the Setup

**Test Email/Password Registration:**

1. Click "Sign Up"
2. Enter username, email, and password
3. Click "SIGN UP"
4. You should be redirected to login

**Test Google Sign-In:**

1. Click "Continue with Google"
2. Select your Google account
3. Grant permissions
4. You should be redirected to the dashboard

## 🔍 Verification Checklist

- [ ] Backend server running on port 3000
- [ ] Frontend server running on port 5173
- [ ] Can access login page
- [ ] Database connection successful
- [ ] Google OAuth button appears
- [ ] No console errors in browser
- [ ] No errors in backend terminal

## 🆘 Common Setup Issues

### Issue: "Cannot find module"

**Solution**: Make sure you ran `npm install` in both directories

### Issue: "Database connection failed"

**Solution**:

- Check connection string in `backend/db.js`
- For Neon: database might be sleeping, wait 30 seconds and retry

### Issue: Google OAuth button is disabled

**Solution**:

- Check `VITE_GOOGLE_CLIENT_ID` exists in `frontend/.env`
- Restart frontend server after creating .env file
- Ensure .env value doesn't contain "YOUR_GOOGLE_CLIENT_ID"

### Issue: "redirect_uri_mismatch" error

**Solution**:

- Go to Google Cloud Console
- Check Authorized redirect URIs include: `http://localhost:5173`
- Make sure there's no typo (http vs https, ports, trailing slashes)
- Wait 5 minutes for changes to propagate

### Issue: Emails not sending

**Solution**:

- Verify Gmail app password is correct (16 characters)
- Check 2FA is enabled on Gmail
- Try generating a new app password

### Issue: "CORS error" in browser console

**Solution**:

- Verify `FRONTEND_URL` in backend/.env is `http://localhost:5173`
- Restart backend server after updating .env

## 🎯 Next Steps

Now that your app is running:

1. **Create an account** using email/password or Google
2. **Try avatar generation** by uploading photos
3. **Browse the catalog** to see available products
4. **Explore the code** in `frontend/src/` and `backend/`

## 📚 Additional Resources

- **Full Documentation**: See [README.md](README.md)
- **API Reference**: Check backend routes in `backend/server.js`
- **Component Guide**: Explore React components in `frontend/src/`

## 💡 Development Tips

### Hot Reload

- Frontend: Vite provides instant hot module replacement
- Backend: Use `nodemon server.js` for auto-restart on changes

### Debugging

- **Backend logs**: Check terminal running `node server.js`
- **Frontend errors**: Open browser DevTools (F12) → Console
- **Network requests**: Browser DevTools → Network tab

### Testing Different Users

- Use incognito/private windows for testing multiple accounts
- Each account needs a unique email address

### Environment Variables

- Changes to `.env` require server restart
- Frontend `.env` variables must start with `VITE_`

---

**Need Help?** Check the [Troubleshooting](#-common-setup-issues) section above or open an issue on GitHub.

**Ready to contribute?** See [README.md](README.md) for contribution guidelines.
