# Deployment Guide

This guide describes how to deploy the AnimeHub application using **MongoDB Atlas** (Database), **Render** (Backend), and **Vercel** (Frontend).

## 1. Database Setup (MongoDB Atlas)

1. **Create an Account/Cluster**: Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and create a free cluster.
2. **Database Access**:
   - Go to "Database Access" -> "Add New Database User".
   - Create a user (e.g., `animehub_admin`) and a secure password. **Save this password**.
3. **Network Access**:
   - Go to "Network Access" -> "Add IP Address".
   - Select "Allow Access from Anywhere" (`0.0.0.0/0`) to allow Render to connect.
4. **Get Connection String**:
   - Click "Connect" on your cluster -> "Connect your application".
   - Copy the URI. It looks like: `mongodb+srv://<username>:<password>@cluster0.Cx3fx.mongodb.net/?retryWrites=true&w=majority`.
   - Replace `<password>` with your actual password.

## 2. Backend Deployment (Render)

We will deploy the `server` folder to Render.

1. **Push to GitHub**: Ensure your code is pushed to a GitHub repository.
2. **Create Web Service**:
   - Log in to [Render](https://render.com/).
   - Click "New" -> "Web Service".
   - Connect your GitHub repository.
3. **Configure Service**:
   - **Name**: `animehub-api` (or similar).
   - **Root Directory**: `server` (Important!).
   - **Runtime**: Node.
   - **Build Command**: `npm install`.
   - **Start Command**: `node app.js`.
4. **Environment Variables**:
   - Scroll down to "Environment Variables" and add:
     - `MONGODB_URI`: (Paste your Atlas connection string).
     - `JWT_SECRET`: (A long random string).
     - `NODE_ENV`: `production`.
     - `CLIENT_URL`: (Leave blank for now, or put `*` to allow all until you have the frontend URL).
5. **Deploy**: Click "Create Web Service".
6. **Get URL**: Once live, copy the service URL (e.g., `https://animehub-api.onrender.com`).

## 3. Frontend Deployment (Vercel)

We will deploy the `client` folder to Vercel.

1. **Create Project**:
   - Log in to [Vercel](https://vercel.com/).
   - Click "Add New..." -> "Project".
   - Import your GitHub repository.
2. **Configure Project**:
   - **Root Directory**: Click "Edit" and select `client`.
   - **Framework Preset**: Vite (should auto-detect).
   - **Build Command**: `vite build` or `npm run build`.
   - **Output Directory**: `dist`.
3. **Environment Variables**:
   - Add the following variable:
     - `VITE_API_BASE_URL`: The URL of your Render backend + `/api` (e.g., `https://animehub-api.onrender.com/api`).
4. **Deploy**: Click "Deploy".
5. **Get URL**: Copy the deployment domain (e.g., `https://animehub-client.vercel.app`).

## 4. Final Configuration

1. **Update Backend CORS**:
   - Go back to your Render dashboard.
   - Update the `CLIENT_URL` environment variable to your new Vercel URL (e.g., `https://animehub-client.vercel.app`).
   - Render will automatically restart.

## 5. Verification

1. Open your Vercel URL.
2. Try to register a new user or login with the seed credentials (`user@animehub.com` / `password123`).
3. Verify that images load and data is fetched from the backend.
