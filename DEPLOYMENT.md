### Configure Google OAuth (Passport)

1) Google Cloud Console → Credentials → Create OAuth Client ID (Web)

- Authorized JavaScript Origins:
  - https://zyncchatai.onrender.com
  - http://localhost:5173

- Authorized Redirect URIs:
  - https://zyncchatai.onrender.com/api/auth/google/callback
  - http://localhost:5001/api/auth/google/callback

2) Environment variables

Backend `.env` (Render settings → Environment):

```
GOOGLE_CLIENT_ID=xxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxxx
GOOGLE_CALLBACK_URL=https://zyncchatai.onrender.com/api/auth/google/callback
FRONTEND_URL=https://zyncchatai.onrender.com
JWT_SECRET=your_jwt_secret
```

Local development `.env`:

```
GOOGLE_CLIENT_ID=xxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxxx
GOOGLE_CALLBACK_URL=http://localhost:5001/api/auth/google/callback
FRONTEND_URL=http://localhost:5173
JWT_SECRET=dev_secret
```

3) Deploy

- Push to GitHub, Render auto-deploys.
- After deploy, visit `https://zyncchatai.onrender.com/login` → Continue with Google.
- On success, backend redirects to `/login?token=JWT` which frontend stores and navigates to home.


