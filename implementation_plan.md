# Full-Stack Personal Portfolio Web Application

A complete SaaS-style personal portfolio with a React frontend, Express.js backend, MongoDB database, and JWT authentication. Includes a public-facing portfolio and a protected admin dashboard.

---

## Proposed Folder Structure

```
kailash/
├── client/                        # React Frontend (Vite)
│   ├── public/
│   ├── src/
│   │   ├── api/                   # Axios instance + API calls
│   │   ├── components/            # Reusable UI components
│   │   │   ├── Navbar.jsx
│   │   │   ├── ProjectCard.jsx
│   │   │   ├── SkillBadge.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx           # Public: Hero + Projects + Skills + Contact
│   │   │   ├── Login.jsx          # Admin login
│   │   │   └── Dashboard.jsx      # Admin dashboard
│   │   ├── context/
│   │   │   └── AuthContext.jsx    # JWT token management
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css              # Global dark theme
│   ├── .env
│   ├── package.json
│   └── vite.config.js
│
├── server/                        # Express.js Backend
│   ├── config/
│   │   └── db.js                  # Mongoose connection
│   ├── middleware/
│   │   └── auth.js                # JWT verification middleware
│   ├── models/
│   │   ├── User.js
│   │   ├── Project.js
│   │   └── Message.js
│   ├── routes/
│   │   ├── auth.js                # /register, /login
│   │   ├── projects.js            # CRUD for projects
│   │   └── messages.js            # Contact form + admin view
│   ├── .env
│   ├── server.js                  # Entry point
│   └── package.json
│
└── README.md                      # Setup + deployment guide
```

---

## Proposed Changes

### Server

#### [NEW] `server/server.js`
Express app entry point with CORS, JSON middleware, and route mounting.

#### [NEW] `server/config/db.js`
Mongoose connection to MongoDB Atlas.

#### [NEW] `server/middleware/auth.js`
JWT `verifyToken` middleware — checks `Authorization: Bearer <token>` header.

#### [NEW] `server/models/User.js`
Mongoose schema: `email`, `password` (bcrypt hashed), `createdAt`.

#### [NEW] `server/models/Project.js`
Mongoose schema: `title`, `description`, `techStack[]`, `liveLink`, `githubLink`, `createdAt`.

#### [NEW] `server/models/Message.js`
Mongoose schema: `name`, `email`, `message`, `createdAt`.

#### [NEW] `server/routes/auth.js`
- `POST /api/auth/register` — Creates admin user with hashed password
- `POST /api/auth/login` — Validates credentials, returns JWT

#### [NEW] `server/routes/projects.js`
- `GET /api/projects` — Public, returns all projects
- `POST /api/projects` — Protected, creates project
- `PUT /api/projects/:id` — Protected, updates project
- `DELETE /api/projects/:id` — Protected, deletes project

#### [NEW] `server/routes/messages.js`
- `POST /api/messages` — Public, creates message from contact form
- `GET /api/messages` — Protected admin only, returns all messages

#### [NEW] `server/.env`
```
PORT=5000
MONGO_URI=mongodb+srv://...
JWT_SECRET=your_secret_key
```

---

### Client

#### [NEW] `client/src/index.css`
Full dark professional theme with CSS variables, typography (Inter from Google Fonts), card styles, button styles, form styles, animations.

#### [NEW] `client/src/context/AuthContext.jsx`
React context storing JWT token in localStorage; `login()` and `logout()` methods.

#### [NEW] `client/src/api/axios.js`
Axios instance with `baseURL` and request interceptor to attach Bearer token.

#### [NEW] `client/src/api/projects.js`
API functions: `getProjects`, `createProject`, `updateProject`, `deleteProject`.

#### [NEW] `client/src/api/messages.js`
API functions: `sendMessage`, `getMessages`.

#### [NEW] `client/src/components/Navbar.jsx`
Responsive nav with logo, section links, and Login/Logout button.

#### [NEW] `client/src/components/ProjectCard.jsx`
Card component showing project title, description, tech stack badges, live + GitHub links.

#### [NEW] `client/src/components/SkillBadge.jsx`
Pill badge for skills display.

#### [NEW] `client/src/components/ProtectedRoute.jsx`
Redirects to `/login` if no valid JWT in context.

#### [NEW] `client/src/pages/Home.jsx`
Four sections:
1. **Hero** — Name, tagline, CTA buttons
2. **Projects** — Fetched from API, rendered as cards
3. **Skills** — Static skill badges
4. **Contact** — Form that posts to `/api/messages`

#### [NEW] `client/src/pages/Login.jsx`
JWT login form, stores token in AuthContext on success.

#### [NEW] `client/src/pages/Dashboard.jsx`
Protected admin page:
- Add/Edit project form
- Projects table with Edit/Delete actions
- Contact messages panel

#### [NEW] `client/src/App.jsx`
React Router v6 routes: `/`, `/login`, `/dashboard`.

---

## Security

| Concern | Solution |
|---|---|
| Password storage | `bcryptjs` with salt rounds = 12 |
| Authentication | JWT with 7-day expiry, stored in localStorage |
| Route protection | `verifyToken` middleware on all write endpoints |
| Input validation | `express-validator` on auth + message routes |
| CORS | Configured to allow only the frontend origin |

---

## UI Style

- **Theme**: Dark professional (`#0a0a0f` bg, `#7c3aed` accent purple)
- **Font**: Inter (Google Fonts)
- **Cards**: Glassmorphism with subtle border glow on hover
- **Animations**: Fade-in on scroll, hover lift on cards, smooth transitions
- **Layout**: CSS Grid + Flexbox, fully responsive

---

## Verification Plan

### Automated
- Start both servers and confirm no startup errors
- Register an admin, login, receive JWT
- Confirm protected routes reject unauthenticated requests

### Manual (Browser)
- Visit public portfolio, verify sections load
- Submit contact form, verify message appears in admin dashboard
- Add, edit, delete a project from dashboard
- Verify mobile responsiveness

---

## Running Locally

```bash
# Server
cd server && npm install && npm run dev

# Client
cd client && npm install && npm run dev
```

---

## Deployment Guide

| Service | Purpose |
|---|---|
| **MongoDB Atlas** | Cloud database |
| **Render** | Express backend hosting |
| **Vercel** | React frontend hosting |

Steps in `README.md`.

---

## Open Questions

> [!IMPORTANT]
> **Your name and bio**: What name and tagline should appear on the portfolio Hero section? (e.g., "Kailash Sharma — Full-Stack Developer")

> [!IMPORTANT]
> **Skills list**: What skills/technologies should be listed in the Skills section?

> [!IMPORTANT]
> **Seed data**: Should I include sample projects pre-loaded into the DB, or start empty and manage via the admin dashboard?

> [!NOTE]
> If you don't answer the open questions, I'll use placeholder values (name: "Kailash", tagline: "Full-Stack Developer", and a standard skill set) that you can update later.
