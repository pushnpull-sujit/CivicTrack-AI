# CivicTrack AI – Production Deployment Guide

This guide details steps to transition CivicTrack AI from a local zero-setup development environment into a production-ready, cloud-hosted architecture.

---

## 🔒 Environment Variable Configuration

To connect the application to real production cloud systems, configure the `.env` file in the `backend/` directory:

```env
# Server settings
PORT=5000
NODE_ENV=production
JWT_SECRET=generate_a_secure_long_random_hash_here

# 1. MongoDB Production Database Connection
# If provided, database adapter switches from local JSON files to Mongoose
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/civictrack

# 2. Cloudinary File Uploads
# If provided, Multer forwards image uploads directly to Cloudinary cloud bucket
CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name

# 3. SMTP Production Mail server (e.g. SendGrid / Mailgun)
# If provided, Nodemailer delivers status emails to real email accounts
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your_real_sendgrid_api_key
```

---

## 🚀 Deployment Instructions

### Option 1: Deployment via Docker in Production

1. Build production bundles:
   - Make sure your Dockerfiles compile React using static server hosting (e.g., using `nginx` to serve the static frontend bundle).
2. Standard deployment command:
   ```bash
   docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
   ```

### Option 2: Deploying Frontend to Vercel/Netlify & Backend to Render/Heroku

#### Step 1: Deploying the Backend API
1. Create a Web Service on **Render.com** (or Heroku).
2. Set Cwd to `backend`.
3. Add Environment variables listed in the section above.
4. Set Build command: `npm install`
5. Set Start command: `node server.js`

#### Step 2: Deploying the React Frontend
1. Create a Project on **Vercel** or **Netlify**.
2. Connect your repository, select `frontend` as root folder.
3. Configure build settings:
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Set Environment variables:
   - `VITE_API_URL`: `https://your-backend-render-url.onrender.com/api`
5. Deploy project.
