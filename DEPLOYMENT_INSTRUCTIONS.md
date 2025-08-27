# Deployment Guide for ZyncChat AI

This guide will help you deploy your MERN stack application with:
- Frontend on Vercel
- Backend on Render
- MongoDB Atlas for database
- Stream API for chat features

## Prerequisites

Before deployment, ensure you have:

1. A Render account (for backend deployment)
2. A Vercel account (for frontend deployment)
3. MongoDB Atlas account with cluster setup
4. Stream API keys (API Key and Secret)

## Backend Deployment on Render

### 1. Prepare Environment Variables

Create a `.env` file in your backend directory with the following variables:

```env
PORT=5001
MONGO_URL=mongodb+srv://tiwariabhishek1277:Asharma1274tiwariji@zyncchatcluster.9hpdf86.mongodb.net/?retryWrites=true&w=majority&appName=ZyncChatCluster
STREAM_API_KEY=ntvk86xetpws
STREAM_API_SECRET=fdwgy9ktv3k2u5y6ftut3473rcczmyxyh54aacufz4kxjep983qyf4y3b95behbt
JWT_SECRET=QiaMQy6Mzz77ZPy0u7MGVR2D7W+9KmL4vmMTeC6Z0KM=
JWT_EXPIRES_IN=3d
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
CLIENT_URL=https://zync-chat-ai.vercel.app
NODE_ENV=production
```

### 2. Deploy to Render

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Set the following configuration:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment**: Node.js
   - **Branch**: main (or your deployment branch)

5. Add environment variables in Render Dashboard:
   - Go to "Environment" section
   - Add all variables from your `.env` file

6. Deploy the service

### 3. CORS Configuration

The backend is configured to accept requests from:
- `http://localhost:5173` (development)
- `https://zync-chat-ai.vercel.app` (production)

This is handled in `backend/server.js`:
```javascript
app.use(
  cors({
    origin: ["http://localhost:5173", "https://zync-chat-ai.vercel.app"],
    credentials: true,
  })
);
```

## Frontend Deployment on Vercel

### 1. Prepare Environment Variables

Create a `.env` file in your frontend directory:

```env
VITE_BACKEND_URL=https://zyncchatai.onrender.com
VITE_STREAM_API_KEY=ntvk86xetpws
```

### 2. Build Configuration

The frontend uses Vite with the following configuration in `vite.config.js`:
```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
});
```

### 3. Deploy to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New Project"
3. Connect your GitHub repository
4. Set the following configuration:
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

5. Add environment variables in Vercel Dashboard:
   - Go to your project settings
   - Add the variables from your `.env` file

6. Deploy the project

## API Routes

All API routes are prefixed with `/api`:
- Authentication: `/api/auth/*`
- User management: `/api/users/*`
- Chat features: `/api/chat/*`

Example API endpoints:
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `GET /api/users/friends` - Get user friends
- `GET /api/chat/token` - Get Stream chat token

## Authentication Flow

The application uses JWT tokens for authentication:
1. User registers or logs in
2. JWT token is returned and stored in localStorage
3. Token is automatically included in Authorization header for all requests
4. Backend verifies token using the auth middleware

## Testing the Deployment

After deployment, test the following flows:

1. **User Registration**:
   - Visit your Vercel frontend URL
   - Click "Sign Up"
   - Fill in registration details
   - Verify you're redirected to onboarding

2. **User Login**:
   - Visit the login page
   - Enter credentials
   - Verify you're redirected to the dashboard

3. **Chat Features**:
   - Visit the chat page
   - Verify Stream API integration works
   - Test sending and receiving messages

4. **Authentication Redirects**:
   - Try to access protected routes without login
   - Verify you're redirected to login page
   - After login, verify you're redirected back to intended page

## Troubleshooting

### CORS Issues
If you encounter CORS issues:
1. Verify `CLIENT_URL` in backend `.env` matches your Vercel URL
2. Check that `origin` in CORS configuration includes your Vercel URL
3. Ensure `credentials: true` is set in CORS options

### Authentication Issues
If authentication isn't working:
1. Verify JWT_SECRET is the same in both environments
2. Check that cookies are being sent with requests (`withCredentials: true`)
3. Ensure sameSite attribute is set to "none" for cross-origin cookies

### API Connection Issues
If frontend can't connect to backend:
1. Verify `VITE_BACKEND_URL` in frontend `.env` matches your Render URL
2. Check that Render service is running
3. Ensure all environment variables are set correctly in Render

## Support

For additional help, refer to:
- [Render Documentation](https://render.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Stream Chat API Documentation](https://getstream.io/chat/docs/)