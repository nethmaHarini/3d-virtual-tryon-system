# VirtuFit3D Studio - 3D Virtual Try-On System

A modern 3D virtual try-on application that allows users to visualize clothing and accessories on virtual avatars. Built with React frontend and Node.js backend with PostgreSQL database.

## 🌟 About This Project

This project was developed by your friend using **GitHub Codespaces** - a cloud-based development environment. That's why you see URLs like:
```
https://stunning-space-fiesta-x5q4j49ww79qh9jw-3000.app.github.dev
```

This is a **temporary cloud development URL** that GitHub provides when developing in Codespaces. It's not a permanent website - it only works while the Codespace is active.

## 🏗️ Project Structure

```
3d-virtual-tryon-system/
├── frontend/                 # React + Vite frontend application
│   ├── src/
│   │   ├── App.jsx          # Main login/register component
│   │   ├── Dashboard.jsx    # User dashboard
│   │   ├── Catalog.jsx      # Product catalog
│   │   ├── AvatarViewer.jsx # 3D avatar component
│   │   └── GarmentDetail.jsx # Product details
│   ├── .env                 # Frontend environment variables
│   └── package.json         # Frontend dependencies
├── backend/                 # Node.js + Express backend
│   ├── server.js           # Main server file
│   ├── db.js               # Database connection
│   ├── .env                # Backend environment variables
│   └── package.json        # Backend dependencies
└── README.md               # This file
```

## 🛠️ Technology Stack

### Frontend
- **React 19** - UI framework
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **@react-oauth/google** - Google authentication
- **Modern CSS** - Custom styling with gradients and animations

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **PostgreSQL** - Database (hosted on Neon)
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT authentication
- **nodemailer** - Email functionality
- **cors** - Cross-origin resource sharing

## 🔐 Environment Variables Explained

### Frontend Environment (`.env`)
```env
# Google OAuth Client ID for authentication
VITE_GOOGLE_CLIENT_ID=1003992750101-ser2fv1rm5ijp96h2ltgkuth2mpae65f.apps.googleusercontent.com
```

### Backend Environment (`.env`)
```env
# Gmail configuration for sending emails (password reset, etc.)
GMAIL_USER=csandamali63@gmail.com
GMAIL_APP_PASSWORD=yhmcenkgyyxssrte

# JWT secret for token signing
JWT_SECRET=mySuperSecretKey_12345_xyz_987

# Frontend URL for CORS and OAuth redirects
FRONTEND_URL=http://localhost:5173

# Google OAuth credentials
GOOGLE_CLIENT_ID=1003992750101-ser2fv1rm5ijp96h2ltgkuth2mpae65f.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
```

### Database Connection (`db.js`)
The project uses **Neon PostgreSQL** (serverless PostgreSQL):
```javascript
// Cloud PostgreSQL database
connectionString: "postgresql://neondb_owner:npg_lj4U7ZvgHSsJ@ep-purple-butterfly-a1ixbwph-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
```

## 🚀 Features

### Authentication System
- **Email/Password Registration & Login**
- **Google OAuth Integration** (Sign in with Google)
- **Password Reset via Email**
- **JWT-based Session Management**

### Core Application
- **User Dashboard** - Personal user area
- **3D Avatar Viewer** - Virtual try-on functionality
- **Product Catalog** - Browse available items
- **Garment Details** - Individual product pages
- **Responsive Design** - Works on desktop and mobile

### Security Features
- **Password Hashing** (bcrypt)
- **JWT Token Authentication**
- **Email Validation**
- **CORS Protection**
- **Input Sanitization**

## 📦 Local Development Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Git

### 1. Clone the Repository
```bash
git clone <repository-url>
cd 3d-virtual-tryon-system
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create `.env` file in backend folder:
```env
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-gmail-app-password
JWT_SECRET=your-super-secret-jwt-key
FRONTEND_URL=http://localhost:5173
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
```

Create `.env` file in frontend folder:
```env
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

### 4. Start Development Servers

**Terminal 1 - Backend:**
```bash
cd backend
node server.js
# or for auto-restart:
npx nodemon server.js
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### 5. Access the Application
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

## 🔧 Google OAuth Setup

To enable Google Sign-In, you need to:

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/

2. **Create/Select Project**
   - Create a new project or select existing one

3. **Enable Google+ API**
   - Navigate to "APIs & Services" > "Library"
   - Search for "Google+ API" and enable it

4. **Create OAuth Credentials**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client ID"
   - Application type: "Web application"

5. **Configure Authorized URLs**
   - **Authorized JavaScript origins:**
     - `http://localhost:5173`
   - **Authorized redirect URIs:**
     - `http://localhost:5173/`

6. **Update Environment Variables**
   - Copy Client ID to both `.env` files
   - Copy Client Secret to backend `.env`

## 📧 Email Configuration

The app uses Gmail for sending password reset emails:

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password:**
   - Go to Google Account settings
   - Security > 2-Step Verification > App passwords
   - Generate password for "Mail"
3. **Update Backend .env:**
   ```env
   GMAIL_USER=your-email@gmail.com
   GMAIL_APP_PASSWORD=generated-app-password
   ```

## 🗄️ Database Schema

The application uses PostgreSQL with the following main table:

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🌐 Deployment Options

### Option 1: Local Development
- Use the setup instructions above
- Perfect for development and testing

### Option 2: GitHub Codespaces (Like Your Friend)
- Fork the repository to your GitHub
- Open in Codespaces
- Automatically gets a dev URL like the one you saw

### Option 3: Cloud Hosting
- **Frontend:** Vercel, Netlify, GitHub Pages
- **Backend:** Railway, Render, Heroku
- **Database:** Neon (already configured), Supabase, PlanetScale

## 🔍 Understanding the GitHub Dev URL

The URL `https://stunning-space-fiesta-x5q4j49ww79qh9jw-3000.app.github.dev` means:
- `stunning-space-fiesta-x5q4j49ww79qh9jw` - Unique Codespace identifier
- `3000` - Port number (backend server)
- `app.github.dev` - GitHub Codespaces domain

This URL is **temporary** and only works while your friend's Codespace is running. Each Codespace gets a unique URL.

## 🆘 Troubleshooting

### Common Issues:

1. **Google OAuth Error "redirect_uri_mismatch"**
   - Check Google Console authorized redirect URIs
   - Ensure URLs match exactly (with/without trailing slash)

2. **CORS Errors**
   - Verify FRONTEND_URL in backend .env matches your frontend URL
   - Check if both servers are running

3. **Database Connection Issues**
   - Neon database might be sleeping (serverless)
   - Check if connection string is correct in `db.js`

4. **Email Not Sending**
   - Verify Gmail app password is correct
   - Check if 2FA is enabled on Gmail account

## 📞 Support

If you encounter issues:
1. Check if all environment variables are set correctly
2. Ensure both frontend and backend servers are running
3. Verify database connection
4. Check browser console for error messages

## 🎯 Next Steps

To continue development:
1. Set up your own Google OAuth credentials
2. Configure your own Gmail for email functionality
3. Customize the UI and add more features
4. Deploy to production when ready

---

**Note:** This is a development version. For production use, ensure all security best practices are followed and sensitive data is properly protected.