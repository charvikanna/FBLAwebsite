# Backend (Node.js + Express + MongoDB + JWT + Google OAuth)

## Folder structure

```text
backend/
  src/
    config/
      db.js
      passport.js
    controllers/
      authController.js
      userController.js
    middleware/
      auth.js
    models/
      User.js
    routes/
      authRoutes.js
      userRoutes.js
    server.js
  .env.example
  .gitignore
  package.json
  README.md
```

## Features implemented

- Email/password signup with bcrypt hashing
- Email/password login with JWT token response
- Google OAuth login with Passport.js
- MongoDB user storage with fields:
  - `email`
  - `password` (for email/password users)
  - `googleId` (for Google users)
  - `profilePicture`
  - `progress` (object/number supported)
- Protected routes with JWT verification middleware:
  - `GET /api/profile`
  - `POST /api/progress`

## Environment variables

Copy `.env.example` to `.env` and fill values:

```bash
cp .env.example .env
```

Required:

- `PORT`
- `MONGODB_URI`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_CALLBACK_URL`
- `FRONTEND_URL`
  - For this repo frontend auth page, set: `http://localhost:8000/login.html`

## Run locally

1. Start MongoDB (local or Atlas).
2. Install dependencies:

```bash
npm install
```

3. Run in dev mode:

```bash
npm run dev
```

Or production mode:

```bash
npm start
```

Server default: `http://localhost:5001`

## API endpoints

### Auth

- `POST /api/auth/signup`

Body:

```json
{
  "email": "student@example.com",
  "password": "StrongPassword123"
}
```

- `POST /api/auth/login`

Body:

```json
{
  "email": "student@example.com",
  "password": "StrongPassword123"
}
```

- `GET /api/auth/google`
- `GET /api/auth/google/callback`

### Protected

Use header:

```text
Authorization: Bearer <JWT_TOKEN>
```

- `GET /api/profile`
  - Returns: `email`, `profilePicture`

- `POST /api/progress`

Body example:

```json
{
  "progress": {
    "lesson1": true,
    "lesson2Score": 90
  }
}
```

Or:

```json
{
  "progress": 42
}
```
