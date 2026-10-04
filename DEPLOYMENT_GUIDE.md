# 🌐 Fixigo Full Production Deployment Guide
### Backend + Database on Render & Frontend on Vercel

This repository is pre-configured and turnkey ready for automated cloud deployment:
- **Backend & WebSockets:** [Render](https://render.com) (Node.js Web Service + PostgreSQL with PostGIS)
- **Frontend SPA:** [Vercel](https://vercel.com) (Vite React Single Page Application)

---

## 📋 Pre-Flight Checklist

- [x] Frontend builds cleanly with zero errors (`npm run build`)
- [x] Backend tests passing 100% (`npm test`)
- [x] Automated database migrations & seed scripts with connection retry logic
- [x] Dynamic CORS & WebSocket handshake configured for Vercel production domains
- [x] Single-Page Application (SPA) client routing rewrite rules in `vercel.json`
- [x] Render Blueprint configured in `render.yaml` (auto-provisions DB + Backend)

---

## 🚀 Step 1: Push Your Code to GitHub

Both Render and Vercel provide seamless continuous deployment by connecting directly to your GitHub repository.

```bash
# 1. Check git status
git status

# 2. Add your GitHub repository as origin (replace with your repo URL)
git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/workconnect.git

# 3. Rename branch to main if needed and push
git branch -M main
git push -u origin main
```

---

## 🐘 Step 2: Deploy Backend & Database on Render

Render hosts the Node.js Express server, Socket.IO WebSockets gateway, and PostgreSQL database.

### 🌟 Option A: Automated 1-Click Blueprint (Recommended)
This repository contains a [`render.yaml`](./render.yaml) file that automatically sets up the PostgreSQL database and backend service in one shot:

1. Log in to [dashboard.render.com](https://dashboard.render.com).
2. Click the **"New +"** button in the top navigation bar and select **"Blueprint"**.
3. Connect your GitHub repository (`workconnect`).
4. Render will inspect `render.yaml` and display the resources to be created:
   - **`fixigo-db`**: PostgreSQL Database (Oregon region, free plan)
   - **`fixigo-backend`**: Node.js Web Service with automatic migrations & seeds
5. Click **"Apply"**.
6. Render will:
   - Provision the PostgreSQL database.
   - Install dependencies (`npm install`).
   - Run database migrations & seeds (`npm run db:deploy`).
   - Start the server (`npm start`).
7. Once deployed, copy your backend URL from Render (e.g., `https://fixigo-backend.onrender.com`).

---

### 🛠 Option B: Manual Setup on Render Dashboard
If you prefer configuring resources manually in the Render dashboard:

#### 1. Create PostgreSQL Database:
1. Click **"New +"** -> **"PostgreSQL"**.
2. **Name**: `fixigo-db`
3. **Database**: `workconnect`
4. **User**: `postgres`
5. **Region**: `Oregon (US West)` (or closest to you)
6. **Plan**: `Free`
7. Click **"Create Database"**.
8. Once created, copy the **Internal Database URL** (or External Database URL).

#### 2. Create Web Service:
1. Click **"New +"** -> **"Web Service"**.
2. Connect your GitHub repository (`workconnect`).
3. Set configuration:
   - **Name**: `fixigo-backend`
   - **Region**: Same as database (e.g. `Oregon`)
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm run db:deploy && npm start`
4. Add **Environment Variables**:
   | Key | Value | Notes |
   |---|---|---|
   | `NODE_ENV` | `production` | Enables production optimizations & SSL |
   | `DATABASE_URL` | *Paste Render PostgreSQL connection string* | Internal DB URL |
   | `JWT_SECRET` | *Click "Generate"* or enter a random 32-char secret | Used to sign auth tokens |
   | `JWT_EXPIRES_IN` | `7d` | Token lifetime |
   | `CLIENT_URL` | `*` (or your Vercel URL once deployed) | Dynamic CORS |
   | `RAZORPAY_KEY_ID` | `rzp_test_1DP5mmOlF5G5ag` | Test key |
   | `RAZORPAY_KEY_SECRET` | `s9G7aL7yG5xL8v9K4w1m0o1p` | Test secret |
   | `RAZORPAY_WEBHOOK_SECRET` | `fixigo_webhook_secret_2026` | Webhook verification |
5. Click **"Create Web Service"**.

---

### 🔍 Verify Backend Deployment:
Open in browser or terminal:
```bash
curl https://<YOUR-RENDER-BACKEND-URL>.onrender.com/api/health
```
Expected response:
```json
{
  "success": true,
  "service": "Fixigo API",
  "status": "operational",
  "database": {
    "status": "connected",
    "postgis": "3.x..."
  }
}
```

---

## ⚡ Step 3: Deploy Frontend on Vercel

Vercel provides blazing-fast global edge hosting for the React + Vite frontend.

### 🌟 Option A: Deploy via Vercel Dashboard (Recommended)

1. Log in to [vercel.com](https://vercel.com).
2. Click **"Add New..."** -> **"Project"**.
3. Import your GitHub repository (`workconnect`).
4. In the **Configure Project** screen:
   - **Framework Preset**: `Vite` (automatically detected)
   - **Root Directory**: Click `Edit` and select `frontend` (or leave root with the included `vercel.json`)
   - **Build and Output Settings**: Defaults are pre-configured:
     - Build Command: `npm run build`
     - Output Directory: `dist`
5. Expand **Environment Variables** and add:
   | Key | Value | Description |
   |---|---|---|
   | `VITE_API_URL` | `https://<YOUR-RENDER-BACKEND-URL>.onrender.com` | Live backend API URL |
   | `VITE_SOCKET_URL` | `https://<YOUR-RENDER-BACKEND-URL>.onrender.com` | Live WebSocket URL |
6. Click **"Deploy"**.
7. Vercel will build the frontend and assign a live production URL (e.g. `https://fixigo.vercel.app`).

---

### 💻 Option B: Deploy via Vercel CLI

If deploying directly from your machine:

```bash
# 1. Log in to Vercel (interactive)
npx vercel login

# 2. Deploy frontend to preview
cd /home/sachin/workconnect/frontend
npx vercel

# 3. Deploy to production with environment variables:
npx vercel --prod --build-env VITE_API_URL="https://<YOUR-RENDER-BACKEND-URL>.onrender.com" --build-env VITE_SOCKET_URL="https://<YOUR-RENDER-BACKEND-URL>.onrender.com"
```

---

## 🔗 Step 4: Link CORS on Render (Optional Polish)

Once your Vercel deployment URL is live (e.g., `https://fixigo-xxx.vercel.app`):
1. Go to your Render Web Service -> **Environment**.
2. Update `CLIENT_URL` to `https://fixigo-xxx.vercel.app` (or keep `*` as backend uses dynamic origin reflection).
3. Save changes.

---

## 🧪 Step 5: Test the Live Application

Visit your live Vercel URL and verify:

1. **Authentication**:
   - Register a new Customer or Professional account.
   - Or log in with seeded accounts:
     - Admin: `admin@workconnect.com` / `Password@123`
     - Customer: `customer@workconnect.com` / `Password@123`
     - Professional: `rahul.electrician@workconnect.com` / `Password@123`
2. **Service Browsing**:
   - Click any category (Electrician, Plumber, AC Repair, Painter, Carpenter, Cleaner, Mechanic, Appliance).
   - Verify distance calculation and rating badges.
3. **Booking & Live GPS Tracking**:
   - Book a service, track professional location on Leaflet map.
4. **Payments & Invoicing**:
   - Test Razorpay test gateway, cash payment workflow, and PDF invoice download.

---

## 💡 Pro Tips for Render Free Tier

- **Render Cold Starts**: Render's free tier spins down web services after 15 minutes of inactivity. The first request after sleep may take ~30-50 seconds to boot.
- **Stay Alive (Optional)**: You can set up a free uptime monitor (like [UptimeRobot](https://uptimerobot.com) or [cron-job.org](https://cron-job.org)) to ping `https://<YOUR-BACKEND>.onrender.com/api/health` every 10 minutes to keep your backend warm 24/7!
