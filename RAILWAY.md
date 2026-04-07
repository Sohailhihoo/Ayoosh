# 🚀 Railway Deployment Guide

Deploy your Beauty Store to Railway.com in minutes!

## Prerequisites
- GitHub account with your code uploaded
- Railway account (free at railway.app)

## Step 1: Create Railway Project

1. Go to [railway.app](https://railway.app) and sign in with GitHub
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose your `beauty-store` (or `Ayooshs1`) repository

## Step 2: Add Services

You need 4 services. In your Railway project:

### 2.1 MongoDB
1. Click **"+ New"** → **"Database"** → **"MongoDB"**
2. Railway auto-provisions it. Copy the `MONGO_URL` from Variables.

### 2.2 Redis  
1. Click **"+ New"** → **"Database"** → **"Redis"**
2. Copy the `REDIS_URL` from Variables.

### 2.3 Backend
1. Click **"+ New"** → **"GitHub Repo"** → Select your repo
2. Set **Root Directory**: `backend`
3. Add these **Environment Variables**:
   | Variable | Value |
   |----------|-------|
   | `PORT` | `5000` |
   | `NODE_ENV` | `production` |
   | `MONGODB_URI` | (paste from MongoDB service) |
   | `REDIS_URL` | (paste from Redis service) |
   | `JWT_SECRET` | (your secret key) |
   | `FRONTEND_URL` | (add after frontend deploys) |

### 2.4 Frontend
1. Click **"+ New"** → **"GitHub Repo"** → Select your repo
2. Set **Root Directory**: `frontend`
3. Add these **Environment Variables**:
   | Variable | Value |
   |----------|-------|
   | `NEXT_PUBLIC_API_URL` | (your backend URL + `/api`) |

## Step 3: Generate Domains

1. Click on each service → **Settings** → **Generate Domain**
2. Copy the URLs:
   - Backend: `https://your-backend.up.railway.app`
   - Frontend: `https://your-frontend.up.railway.app`

## Step 4: Update Environment Variables

Go back and update:
- **Backend** `FRONTEND_URL`: `https://your-frontend.up.railway.app`
- **Frontend** `NEXT_PUBLIC_API_URL`: `https://your-backend.up.railway.app/api`

## Step 5: Redeploy

Click **"Redeploy"** on both frontend and backend after updating variables.

## Done! 🎉

Your app is live at: `https://your-frontend.up.railway.app`

---

## Troubleshooting

**Build fails?**
- Check the deployment logs in Railway dashboard

**CORS errors?**
- Ensure `FRONTEND_URL` in backend matches your frontend domain exactly

**Database not connecting?**
- Verify `MONGODB_URI` is correct (Railway provides this automatically)
