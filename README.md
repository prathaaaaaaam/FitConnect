# 💪 FitConnect — Fitness Social Media Platform

> A full-stack MERN application that unifies workout tracking, progress visualization, and social fitness networking in one powerful platform.

---

## ✨ Features (Iteration 1)

### 🔐 Authentication
- JWT-based registration & login
- Secure password hashing with bcrypt
- Protected routes, auto token refresh

### 🏋️ Workout Logging
- Full exercise library (50+ exercises seeded)
- Set/rep/weight tracking per exercise
- Auto-calculate total volume (kg)
- **Personal Record (PR) detection** with celebration modal 🎉
- Live workout timer
- Public/private workout toggle

### 📊 Dashboard & Analytics
- Volume progression chart (8-week area chart)
- Weekly workout frequency bar chart
- Stats: total workouts, volume, streak, PRs
- Recent workout history

### 📱 Social Feed
- Following feed + Discover tab
- Like & comment on workouts
- Real-time exercise previews with weight data

### 🔍 Exercise Library
- 50+ exercises with muscle group filters
- Search by name or muscle
- Filter by category / difficulty / equipment
- Expandable cards with instructions

### 👤 Profiles
- Public profile pages (`/profile/:username`)
- Follow / unfollow users
- PR showcase section
- Edit profile (name, bio, goal)

### 🔎 Discover
- Search athletes by name or username
- Quick follow from search results

---

## 🛠 Tech Stack (Pure MERN)

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, React Router v6, Recharts |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB + Mongoose |
| **Auth** | JWT + bcryptjs |
| **Styling** | Pure CSS (custom design system) |
| **Build Tool** | Vite |

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- MongoDB running locally (or MongoDB Atlas URI)

### 1. Clone & Install
```bash
# Install all dependencies
npm run install:all
```

### 2. Environment Setup

The `.env` files are pre-configured for local development:
- **Server**: `server/.env` → MongoDB URI, JWT secret, port
- **Client**: `client/.env` → API URL

For MongoDB Atlas, update `server/.env`:
```env
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/fitconnect
```

### 3. Seed the Exercise Library
```bash
npm run seed
```
This populates MongoDB with 50+ exercises across all muscle groups.

### 4. Run Development Servers
```bash
npm run dev
```

This starts:
- **Backend** → `http://localhost:5000`
- **Frontend** → `http://localhost:5173`

---

## 📁 Project Structure

```
fitconnect/
├── package.json              ← Root scripts
│
├── server/                   ← Express + Mongoose API
│   ├── server.js             ← Entry point
│   ├── .env                  ← Environment variables
│   ├── models/
│   │   ├── User.js           ← User schema (auth, stats, PRs, social)
│   │   ├── Workout.js        ← Workout + sets schema
│   │   └── Exercise.js       ← Exercise library schema
│   ├── routes/
│   │   ├── auth.js           ← /api/auth (register, login, me)
│   │   ├── workouts.js       ← /api/workouts (CRUD, likes, comments)
│   │   ├── exercises.js      ← /api/exercises (library + search)
│   │   ├── feed.js           ← /api/feed (following + discover)
│   │   └── users.js          ← /api/users (profile, follow, search)
│   ├── middleware/
│   │   └── auth.js           ← JWT protect middleware
│   └── scripts/
│       └── seedExercises.js  ← 50+ exercise seed data
│
└── client/                   ← React + Vite frontend
    ├── index.html
    ├── vite.config.js        ← Proxy to backend
    └── src/
        ├── main.jsx
        ├── App.jsx           ← Router + auth guards
        ├── index.css         ← Global design system
        ├── api/
        │   └── axios.js      ← Axios instance + interceptors
        ├── context/
        │   ├── AuthContext.jsx   ← Global auth state
        │   └── ToastContext.jsx  ← Notification system
        ├── components/
        │   ├── Layout.jsx    ← Sidebar navigation
        │   └── Layout.css
        └── pages/
            ├── AuthPage.jsx  ← Login + Register
            ├── Dashboard.jsx ← Stats, charts, recent workouts
            ├── LogWorkout.jsx ← Full workout builder
            ├── Feed.jsx      ← Social activity feed
            ├── Exercises.jsx ← Exercise library browser
            ├── Profile.jsx   ← User profile + PR showcase
            └── Discover.jsx  ← User search & follow
```

---

## 🔌 API Endpoints

### Auth
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login, get JWT |
| GET | `/api/auth/me` | Get current user |

### Workouts
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/workouts` | Log new workout |
| GET | `/api/workouts/my` | Get own workouts |
| GET | `/api/workouts/stats` | Get stats + charts data |
| GET | `/api/workouts/:id` | Get single workout |
| POST | `/api/workouts/:id/like` | Like / unlike |
| POST | `/api/workouts/:id/comment` | Add comment |
| DELETE | `/api/workouts/:id` | Delete workout |

### Exercises
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/exercises` | List (with filters) |
| GET | `/api/exercises/:id` | Single exercise |
| POST | `/api/exercises` | Create custom exercise |

### Feed
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/feed` | Following feed |
| GET | `/api/feed/discover` | Discover all public |

### Users
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/users/search?q=` | Search users |
| GET | `/api/users/:username` | Public profile |
| POST | `/api/users/:id/follow` | Follow / unfollow |
| PATCH | `/api/users/me` | Update own profile |

---

## 🗓 Roadmap (Future Iterations)

- [ ] Real-time notifications (Socket.io)
- [ ] Progress photo uploads (Cloudinary)
- [ ] Challenge creation with leaderboards
- [ ] Workout program templates & sharing
- [ ] Gym check-in with location services
- [ ] Form check video upload + community feedback
- [ ] Advanced analytics (muscle balance, PR history charts)
- [ ] Native mobile app (React Native)

---

## 👥 Team

| Name | ID |
|------|----|
| Pratham Sorte | 1032240024 |
| Sarthak Parashetti | 1032240067 |
| Tushar Gitte | 1032240020 |
| Abhineet Chowdhury | 1032240036 |

**Course**: Full Stack Web Development Lab — MIT World Peace University  
**Faculty**: Dr. Sanket Salvi  
**Academic Year**: 2025-26, Semester 6

---

## 📄 License
MIT License — Built for educational purposes.
