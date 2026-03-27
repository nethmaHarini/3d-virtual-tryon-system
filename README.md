# VirtuFit3D Studio - 3D Virtual Try-On System

A modern full-stack 3D virtual try-on application that allows users to generate personalized avatars and virtually try on clothing. Built with React, Node.js, Express, and PostgreSQL.

[![React](https://img.shields.io/badge/React-19-blue)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14%2B-blue)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## 🌟 Features

- **User Authentication**: Secure registration/login with JWT tokens and Google OAuth 2.0 integration
- **Avatar Generation**: Upload body photos (front, back, side) to create personalized 3D avatars
- **Product Catalog**: Browse t-shirts and trousers with detailed product views
- **Virtual Try-On**: Visualize clothing on personalized 3D avatars
- **Password Reset**: Email-based password recovery system
- **Responsive Design**: Modern UI with gradient themes optimized for all devices

## 🏗️ Project Structure

```
3d-virtual-tryon-system/
├── frontend/                    # React + Vite frontend application
│   ├── src/
│   │   ├── main.jsx            # App entry point with routing
│   │   ├── App.jsx             # Login/Register/Forgot Password
│   │   ├── Dashboard.jsx       # Avatar generation interface
│   │   ├── AvatarViewer.jsx    # Display generated 3D avatars
│   │   ├── Catalog.jsx         # Product catalog browser
│   │   ├── GarmentDetail.jsx   # Individual product details
│   │   └── ResetPassword.jsx   # Password reset page
│   ├── .env                    # Frontend environment variables
│   └── package.json            # Frontend dependencies
├── backend/                     # Node.js + Express backend
│   ├── server.js               # Main server with API routes
│   ├── db.js                   # PostgreSQL database connection
│   ├── .env                    # Backend environment variables
│   └── package.json            # Backend dependencies
├── README.md                    # Project documentation (this file)
└── SETUP.md                     # Quick setup guide
```

## 🛠️ Technology Stack

### Frontend

- **React 19** - Modern UI framework with hooks
- **Vite** - Fast build tool and dev server
- **React Router v6** - Client-side routing
- **@react-oauth/google** - Google OAuth integration
- **CSS-in-JS** - Custom styling with modern design

### Backend

- **Node.js** - JavaScript runtime
- **Express.js 5** - Web application framework
- **PostgreSQL** - Relational database
- **JWT (jsonwebtoken)** - Secure authentication tokens
- **bcryptjs** - Password hashing
- **nodemailer** - Email functionality for password reset
- **multer** - Multipart form data handling
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variable management

### Database

- **Neon PostgreSQL** - Serverless PostgreSQL hosting
- **pg (node-postgres)** - PostgreSQL client for Node.js

## 📋 API Endpoints

### Authentication

- `POST /register` - Create new user account
- `POST /login` - Email/password authentication
- `POST /auth/google` - Google OAuth authentication
- `POST /forgot-password` - Request password reset email
- `POST /reset-password/:token` - Reset password with token

### Avatar & Features

- `POST /generate-avatar` - Generate 3D avatar from photos (requires auth)
- `GET /generated-avatars/*` - Serve generated avatar files

### Health Check

- `GET /` - Server status check

## 🎯 Core Features

### Authentication System

- ✅ **Email/Password Registration** - Secure account creation with validation
- ✅ **Email/Password Login** - JWT-based authentication
- ✅ **Google OAuth 2.0** - Sign in with Google account
- ✅ **Password Reset** - Email-based password recovery
- ✅ **Token Management** - Secure JWT tokens (1-hour expiry)
- ✅ **Auto-user Creation** - First-time Google users automatically registered

### Avatar Generation

- ✅ **Multi-angle Photo Upload** - Front, back, and side view photos
- ✅ **Height Input** - User height specification (100-250 cm)
- ✅ **Image Validation** - Format and file size checks (max 5MB per image)
- ✅ **Privacy Protection** - Photos processed in-memory only, not stored
- ✅ **GLB Export** - Generated avatars in 3D GLB format
- ✅ **User Association** - Avatars linked to user accounts

### Product Catalog

- ✅ **Category Browsing** - T-Shirts and Trousers sections
- ✅ **Product Grid View** - Visual product display with images
- ✅ **Product Details** - Individual product pages with size selection
- ✅ **Size Selection** - S, M, L size options
- ✅ **Navigation** - Breadcrumbs and back navigation

### Security Features

- ✅ **Password Hashing** - bcrypt with salt rounds
- ✅ **Email Validation** - Format and domain validation
- ✅ **Input Sanitization** - Protection against malicious input
- ✅ **CORS Protection** - Controlled cross-origin access
- ✅ **Protected Routes** - Authentication-required endpoints

## 🔐 Environment Variables

**⚠️ Important**: Never commit `.env` files to version control. Create them locally using the templates below.

### Backend `.env` (backend/.env)

```env
# Gmail Configuration for Password Reset Emails
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-16-char-app-password

# JWT Secret for Token Signing (use a strong random string)
JWT_SECRET=your-super-secret-jwt-key-min-32-chars

# Frontend URL for CORS and OAuth Redirects
FRONTEND_URL=http://localhost:5173

# Google OAuth Credentials
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### Frontend `.env` (frontend/.env)

```env
# Google OAuth Client ID
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

### Database Connection (backend/db.js)

Update the connection string in `backend/db.js`:

```javascript
connectionString: "postgresql://username:password@host:port/database?sslmode=require";
```

For Neon PostgreSQL, use the connection string provided in your Neon dashboard.

## 📦 Quick Start

See [SETUP.md](SETUP.md) for detailed setup instructions.

### Prerequisites

- Node.js 16+ and npm
- PostgreSQL database (or Neon account)
- Gmail account for email functionality
- Google Cloud Console project for OAuth

### Installation

```bash
# Clone repository
git clone <repository-url>
cd 3d-virtual-tryon-system

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Configuration

1. Create `.env` files in both `backend/` and `frontend/` directories
2. Set up PostgreSQL database
3. Configure Google OAuth credentials
4. Set up Gmail app password

### Running

```bash
# Terminal 1 - Backend (from backend/ directory)
npm run dev
# or
node server.js

# Terminal 2 - Frontend (from frontend/ directory)
npm run dev
```

Access the application at `http://localhost:5173`

## 🗄️ Database Schema

### Users Table

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  reset_token VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Avatars Table

```sql
CREATE TABLE avatars (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  avatar_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🔧 Google OAuth Setup

### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project or select existing
3. Enable "Google+ API" in APIs & Services

### 2. Create OAuth 2.0 Credentials

1. Navigate to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client ID"
3. Application type: "Web application"

### 3. Configure Authorized URLs

**Authorized JavaScript origins:**

- `http://localhost:5173`

**Authorized redirect URIs:**

- `http://localhost:5173`
- `http://localhost:5173/`

**Note**: The redirect URI must match exactly (including trailing slash). For production, add your production URLs.

### 4. Update Environment Variables

Copy the Client ID and Client Secret to your `.env` files as shown above.

## 📧 Gmail Configuration for Emails

### 1. Enable 2-Factor Authentication

Enable 2FA on your Gmail account in Google Account Security settings.

### 2. Generate App Password

1. Go to Google Account > Security > 2-Step Verification
2. Scroll to "App passwords"
3. Select "Mail" and generate password
4. Copy the 16-character password

### 3. Update Backend .env

```env
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx  # 16-char app password
```

## 🆘 Troubleshooting

### Common Issues

#### Google OAuth "redirect_uri_mismatch" Error

**Solution:**

- Ensure redirect URI in Google Console matches exactly: `http://localhost:5173` (no trailing slash)
- Check `FRONTEND_URL` in backend/.env is set to `http://localhost:5173`
- Clear browser cache for `accounts.google.com`
- Wait 5-10 minutes for Google changes to propagate

#### CORS Errors

**Solution:**

- Verify `FRONTEND_URL` in backend/.env matches your frontend URL
- Ensure both servers are running on correct ports
- Check browser console for specific CORS error details

#### Database Connection Issues

**Solution:**

- Verify connection string in `backend/db.js`
- For Neon: Database may be sleeping (serverless), retry after a few seconds
- Check firewall/network settings
- Ensure PostgreSQL service is running (if self-hosted)

#### Email Not Sending

**Solution:**

- Verify Gmail app password is correct (16 characters)
- Ensure 2FA is enabled on Gmail account
- Check `GMAIL_USER` and `GMAIL_APP_PASSWORD` in backend/.env
- Check backend console for nodemailer error messages

#### Avatar Generation Fails with 401 Error

**Solution:**

- User must be logged in
- Check JWT token is stored in localStorage
- Verify token hasn't expired (1-hour expiry)
- Check Authorization header is sent: `Bearer <token>`

## 🌐 Deployment

### Frontend Deployment (Vercel/Netlify)

1. Build command: `npm run build`
2. Output directory: `dist`
3. Set environment variable: `VITE_GOOGLE_CLIENT_ID`
4. Update Google OAuth redirect URIs with production URL

### Backend Deployment (Railway/Render/Heroku)

1. Set all environment variables from `.env`
2. Update `FRONTEND_URL` to production frontend URL
3. Ensure PostgreSQL database is accessible
4. Update Google OAuth authorized origins with production backend URL

### Database Deployment

- **Neon**: Already cloud-hosted, just use the connection string
- **Self-hosted**: Ensure PostgreSQL is accessible from backend server
- **Other providers**: Supabase, PlanetScale, or AWS RDS

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For issues and questions:

- Check the [Troubleshooting](#-troubleshooting) section
- Review closed GitHub issues
- Open a new issue with detailed description

## 🎯 Roadmap

- [ ] Real 3D avatar generation integration
- [ ] Sketchfab API integration for garments
- [ ] Enhanced avatar customization
- [ ] Shopping cart and checkout
- [ ] User profile management
- [ ] Avatar history and gallery
- [ ] Social sharing features
- [ ] Mobile app (React Native)

---

**Developed with ❤️ using React, Node.js, and PostgreSQL**
