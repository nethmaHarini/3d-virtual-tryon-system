# Render Deployment Guide

## Backend Deployment on Render

### Step 1: Push Your Changes

```bash
git add .
git commit -m "Configure backend for Render deployment"
git push origin main
```

### Step 2: Create a New Web Service on Render

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure the service:

**Basic Settings:**

- **Name**: `virtufit3d-backend` (or your preferred name)
- **Region**: Choose closest to your users
- **Branch**: `main`
- **Root Directory**: `backend`
- **Runtime**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`

**Instance Type:**

- Free tier is fine for testing
- Upgrade to paid for production

### Step 3: Add Environment Variables

In Render Dashboard → Environment tab, add these variables:

| Key                    | Value                                                                                                                                                        | Notes                                                       |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------- |
| `DATABASE_URL`         | `<your-database-connection-string>` | Your Neon PostgreSQL connection string                      |
| `JWT_SECRET`           | `your-super-secret-jwt-key-min-32-chars`                                                                                                                     | Generate a strong random string                             |
| `GMAIL_USER`           | `your-email@gmail.com`                                                                                                                                       | Your Gmail address                                          |
| `GMAIL_APP_PASSWORD`   | `xxxx xxxx xxxx xxxx`                                                                                                                                        | Your 16-char Gmail app password                             |
| `GOOGLE_CLIENT_ID`     | `your-google-client-id.apps.googleusercontent.com`                                                                                                           | From Google Cloud Console                                   |
| `GOOGLE_CLIENT_SECRET` | `your-google-client-secret`                                                                                                                                  | From Google Cloud Console                                   |
| `FRONTEND_URL`         | `https://your-vercel-app.vercel.app`                                                                                                                         | Your Vercel frontend URL (update after frontend deployment) |
| `NODE_VERSION`         | `18.17.0`                                                                                                                                                    | Optional: specify Node.js version                           |

⚠️ **Important**: Keep your actual credentials secure! Replace placeholder values above.

### Step 4: Deploy

1. Click **"Create Web Service"**
2. Render will automatically deploy your backend
3. Wait for deployment to complete (~2-5 minutes)
4. Your backend URL will be: `https://virtufit3d-backend.onrender.com`

### Step 5: Update Frontend Configuration

After backend is deployed, update your frontend to use the backend URL:

1. In your frontend code, find all API calls (likely using `fetch` or `axios`)
2. Replace `http://localhost:3000` with your Render URL
3. Or better yet, use an environment variable:
   - Create `VITE_API_URL` in Vercel
   - Set it to your Render backend URL
   - Use it in your code: `${import.meta.env.VITE_API_URL}/login`

### Step 6: Update Google OAuth Settings

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** → **Credentials**
3. Edit your OAuth 2.0 Client ID
4. Add to **Authorized JavaScript origins**:
   - `https://your-vercel-app.vercel.app`
   - `https://virtufit3d-backend.onrender.com`
5. Add to **Authorized redirect URIs**:
   - `https://your-vercel-app.vercel.app`
   - `https://your-vercel-app.vercel.app/`

### Step 7: Update CORS in Backend (if needed)

Your backend currently allows all origins (`origin: "*"`). For production, you might want to restrict this to your frontend URL.

In `server.js`, update:

```javascript
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "*",
    credentials: true,
  }),
);
```

## Troubleshooting

### Free Tier Limitations

- Render free tier services spin down after 15 minutes of inactivity
- First request after sleep takes ~30-60 seconds to wake up
- Solution: Upgrade to paid tier ($7/month) for always-on service

### Database Connection Issues

- Verify `DATABASE_URL` is correctly set in Render
- Check if Neon database is active (serverless databases can sleep)
- Test connection in Render shell: `node -e "require('./db')"`

### Environment Variables Not Working

- Ensure no typos in variable names
- Restart service after adding new variables
- Check logs: Render Dashboard → Logs tab

### Deployment Fails

- Check build logs in Render Dashboard
- Verify `package.json` has `"start": "node server.js"`
- Ensure all dependencies are in `dependencies` not `devDependencies`

## Monitoring

- **Logs**: Render Dashboard → Your Service → Logs
- **Metrics**: Monitor CPU, Memory, and Request metrics
- **Health Check**: Render automatically monitors your `/` endpoint

## Next Steps

1. ✅ Backend deployed on Render
2. ⬜ Update frontend API endpoints to use Render URL
3. ⬜ Deploy frontend to Vercel (already configured)
4. ⬜ Update Google OAuth with production URLs
5. ⬜ Test complete authentication flow
6. ⬜ Test avatar generation end-to-end

---

**Need help?** Check Render's [documentation](https://render.com/docs) or create an issue in this repo.
