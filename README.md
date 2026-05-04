# Kailash — Full-Stack Portfolio

A complete personal portfolio web application with a public-facing site and a protected admin dashboard.

**Stack:** React (Vite) · Node.js · Express · MongoDB · JWT

---

## Project Structure

```
kailash/
├── client/          # React frontend (Vite)
└── server/          # Express.js backend API
```

---

## ⚡ Running Locally

### Prerequisites
- Node.js 18+
- A MongoDB connection string (local or Atlas)

### 1. Set up the Server

```bash
cd server
npm install
```

Edit `server/.env`:
```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<pass>@cluster0.xxxxx.mongodb.net/portfolio
JWT_SECRET=change_this_to_a_random_secret
CLIENT_URL=http://localhost:5173
```

Start the backend:
```bash
npm run dev
```
Server runs at **http://localhost:5000**

---

### 2. Set up the Client

```bash
cd client
npm install
```

Edit `client/.env`:
```env
VITE_API_URL=http://localhost:5000
```

Start the frontend:
```bash
npm run dev
```
App runs at **http://localhost:5173**

---

### 3. Create Your Admin Account

Once the server is running, register your admin:

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"yourpassword"}'
```

Then log in at **http://localhost:5173/login**

---

## 🔌 API Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | ❌ | Create admin account |
| POST | `/api/auth/login` | ❌ | Login, returns JWT |
| GET | `/api/projects` | ❌ | Get all projects |
| POST | `/api/projects` | ✅ | Add a project |
| PUT | `/api/projects/:id` | ✅ | Update a project |
| DELETE | `/api/projects/:id` | ✅ | Delete a project |
| POST | `/api/messages` | ❌ | Send contact message |
| GET | `/api/messages` | ✅ | Get all messages |
| DELETE | `/api/messages/:id` | ✅ | Delete a message |

---

## 🚀 Deployment Guide

### MongoDB Atlas
1. Create an account at [mongodb.com/atlas](https://mongodb.com/atlas)
2. Create a free M0 cluster
3. Add a DB user with a password
4. Whitelist IP `0.0.0.0/0` (or your Render IP)
5. Copy the connection string → set as `MONGO_URI`

---

### Backend on Render
1. Push your repo to GitHub
2. Go to [render.com](https://render.com) → New Web Service
3. Connect your GitHub repo
4. Set:
   - **Root Directory:** `server`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
5. Add Environment Variables:
   - `MONGO_URI` = your Atlas URI
   - `JWT_SECRET` = random 64-char string
   - `CLIENT_URL` = your Vercel URL (add after deploying frontend)
6. Deploy — Render gives you a URL like `https://portfolio-api.onrender.com`

---

### Frontend on Vercel
1. Go to [vercel.com](https://vercel.com) → New Project
2. Import your GitHub repo
3. Set:
   - **Root Directory:** `client`
   - **Framework Preset:** Vite
4. Add Environment Variable:
   - `VITE_API_URL` = your Render backend URL
5. Deploy!

---

## 🔐 Security Notes

- Passwords hashed with **bcrypt** (12 salt rounds)
- JWTs expire after **7 days**
- All admin routes require `Authorization: Bearer <token>`
- Input validation with **express-validator** on all write endpoints

---

## ✏️ Customization

| What to change | Where |
|---|---|
| Your name / tagline | `client/src/pages/Home.jsx` → Hero section |
| Skills list | `client/src/pages/Home.jsx` → `SKILLS` array |
| Color theme / accent | `client/src/index.css` → `:root` variables |
| Footer text | `client/src/pages/Home.jsx` → footer |
