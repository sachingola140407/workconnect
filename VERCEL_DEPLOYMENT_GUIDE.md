# 🚀 Fixigo Vercel Deployment Guide

Fixigo is pre-configured and 100% turnkey ready for deployment to **Vercel**.

---

## 🛠 What Has Been Configured

1. **`vercel.json` (Root & Frontend)**:
   - Configured with Vite framework presets, `npm run build`, output directory `dist`, and client-side SPA route rewrites (so routes like `/services`, `/customer`, `/professional`, `/admin`, and `/track/:id` never 404 on refresh).
2. **Environment Variable Integration (`VITE_API_URL`)**:
   - `frontend/src/services/api.js` automatically detects `import.meta.env.VITE_API_URL`.
   - Socket.IO live GPS gateway connects dynamically to `VITE_API_URL` or `VITE_SOCKET_URL`.
3. **CORS & Authentication**:
   - Backend CORS dynamically permits Vercel preview and production domains (`*.vercel.app`).
   - Clean authentication for real customers and verified service partners (zero guest IDs / demo credentials).

---

## 📦 Method 1: Deploy via GitHub to Vercel (Recommended)

1. **Push your code to GitHub**:
   ```bash
   git add .
   git commit -m "feat: Fixigo UI redesign, guest ID removal & Vercel readiness"
   git push origin main
   ```

2. **Import into Vercel**:
   - Go to [vercel.com](https://vercel.com) and click **"Add New Project"** -> **"Project"**.
   - Select your `workconnect` GitHub repository.
   - **Framework Preset**: Vite (detected automatically).
   - **Root Directory**: Select `frontend` (or leave default root, both work with the included `vercel.json`).

3. **Configure Environment Variables in Vercel**:
   In your Vercel Project Settings, add:
   | Key | Value | Description |
   |---|---|---|
   | `VITE_API_URL` | `https://your-fixigo-backend.onrender.com` | Your deployed backend URL |
   | `VITE_SOCKET_URL` | `https://your-fixigo-backend.onrender.com` | Socket.IO gateway URL |

4. **Click "Deploy"**:
   - Vercel will build and assign you a production URL (e.g. `https://fixigo.vercel.app`).

---

## 💻 Method 2: Deploy via Vercel CLI

If you have the Vercel CLI installed:
```bash
# 1. Navigate to frontend directory
cd frontend

# 2. Login and deploy
npx vercel

# 3. For production release:
npx vercel --prod
```

---

## 🌐 Backend Hosting Note (PostgreSQL & Socket.IO)

Because Vercel functions are stateless serverless lambdas, persistent Socket.IO WebSockets and a live PostgreSQL database run best on:
- **Render** (Free Web Service + Free PostgreSQL): [render.com](https://render.com)
- **Railway**: [railway.app](https://railway.app)
- **Fly.io** or a standard **VPS / Ubuntu server**

Once your backend is running, simply paste its URL into your Vercel project's `VITE_API_URL` environment variable!
